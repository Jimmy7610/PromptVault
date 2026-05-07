import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execFileAsync = promisify(execFile)

const PROJECT_ROOT = process.cwd()
const EXPECTED_REMOTE = 'https://github.com/Jimmy7610/PromptVault.git'

function git(args: string[]) {
  return execFileAsync('git', args, { cwd: PROJECT_ROOT, timeout: 30_000 })
}

// Files that are generated/installed and can be safely restored without losing user work.
const AUTO_FIXABLE = new Set(['next-env.d.ts', 'package-lock.json'])

// git porcelain format: "XY path" — path starts at char 3.
// Exclude vault/ lines so local data files are never counted as dirty code.
function nonVaultDirtyLines(porcelain: string): string[] {
  return porcelain.split('\n').filter((line) => {
    if (!line.trim()) return false
    const filePath = line.slice(3).replace(/^"/, '')
    return (
      !filePath.startsWith('vault/') &&
      filePath !== 'vault' &&
      !filePath.startsWith('vault\\')
    )
  })
}

// Extract the file path from a porcelain status line.
// Handles renames ("R  old -> new") by taking the destination.
function extractFilePath(line: string): string {
  const raw = line.slice(3)
  const arrow = raw.indexOf(' -> ')
  const name = arrow >= 0 ? raw.slice(arrow + 4) : raw
  return name.replace(/^"/, '').replace(/"$/, '').trim()
}

export async function GET() {
  const warnings: string[] = []
  const errors: string[] = []

  try {
    // ── 1. Verify this is a git repo ───────────────────────────────────────────
    try {
      await git(['rev-parse', '--git-dir'])
    } catch {
      return NextResponse.json({
        ok: false,
        errors: [
          'Not a git repository. Run "git init" and connect the remote origin to use the updater.',
        ],
        warnings: [],
        canInstall: false,
      })
    }

    // ── 2. Current commit ──────────────────────────────────────────────────────
    let currentCommit = ''
    try {
      const { stdout } = await git(['rev-parse', '--short', 'HEAD'])
      currentCommit = stdout.trim()
    } catch {
      errors.push('Could not read current commit (HEAD may not exist yet).')
    }

    // ── 3. Current branch ──────────────────────────────────────────────────────
    let branch = ''
    try {
      const { stdout } = await git(['branch', '--show-current'])
      branch = stdout.trim() || 'unknown'
    } catch {
      branch = 'unknown'
    }

    // ── 4. Remote URL ──────────────────────────────────────────────────────────
    let remoteUrl = ''
    try {
      const { stdout } = await git(['remote', 'get-url', 'origin'])
      remoteUrl = stdout.trim()
    } catch {
      return NextResponse.json({
        ok: false,
        currentCommit,
        branch,
        remoteUrl: '',
        errors: [
          `No remote "origin" configured. Expected: ${EXPECTED_REMOTE}`,
        ],
        warnings: [],
        canInstall: false,
      })
    }

    if (remoteUrl !== EXPECTED_REMOTE) {
      return NextResponse.json({
        ok: false,
        currentCommit,
        branch,
        remoteUrl,
        errors: [
          `Remote origin is "${remoteUrl}" but expected "${EXPECTED_REMOTE}". ` +
            'Refusing to update from an unexpected remote.',
        ],
        warnings: [],
        canInstall: false,
      })
    }

    // ── 5. Fetch origin/main ───────────────────────────────────────────────────
    try {
      await git(['fetch', 'origin', 'main'])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return NextResponse.json({
        ok: false,
        currentCommit,
        branch,
        remoteUrl,
        errors: [`Could not fetch from origin: ${msg}`],
        warnings: [],
        canInstall: false,
      })
    }

    // ── 6. Latest commit on origin/main ───────────────────────────────────────
    let latestCommit = ''
    try {
      const { stdout } = await git(['rev-parse', '--short', 'origin/main'])
      latestCommit = stdout.trim()
    } catch {
      errors.push('Could not read latest commit from origin/main.')
    }

    // ── 7. Working tree clean (vault/ excluded) ────────────────────────────────
    let workingTreeClean = false
    let dirtyFiles: string[] = []
    let autoFixableDirtyFiles: string[] = []
    let blockingDirtyFiles: string[] = []
    let onlyAutoFixableChanges = false

    try {
      const { stdout } = await git(['status', '--porcelain'])
      const relevantLines = nonVaultDirtyLines(stdout)
      dirtyFiles = relevantLines.map(extractFilePath)
      autoFixableDirtyFiles = dirtyFiles.filter((f) => AUTO_FIXABLE.has(path.basename(f)))
      blockingDirtyFiles = dirtyFiles.filter((f) => !AUTO_FIXABLE.has(path.basename(f)))
      onlyAutoFixableChanges = dirtyFiles.length > 0 && blockingDirtyFiles.length === 0
      workingTreeClean = dirtyFiles.length === 0

      if (blockingDirtyFiles.length > 0) {
        const sample = blockingDirtyFiles.slice(0, 3).join(', ')
        errors.push(
          `Working tree has uncommitted code changes: ${sample}. ` +
            'Commit, stash, or discard these changes before updating.'
        )
      } else if (onlyAutoFixableChanges) {
        warnings.push(
          `Only generated/install files have changed (${autoFixableDirtyFiles.join(', ')}). ` +
            'These can be safely restored before updating using "Clean generated changes". ' +
            'Your vault data and saved prompts are not affected.'
        )
      }
    } catch {
      errors.push('Could not check working tree status.')
    }

    // ── 8. vault/ is git-ignored ───────────────────────────────────────────────
    let vaultIgnored = false
    try {
      await git(['check-ignore', '-q', 'vault'])
      vaultIgnored = true
    } catch {
      // exit 1 = not ignored
    }

    // Also verify vault/index.json if the vault folder exists
    if (vaultIgnored) {
      const vaultIndexPath = path.join(PROJECT_ROOT, 'vault', 'index.json')
      if (fs.existsSync(vaultIndexPath)) {
        const gitPath = path.join('vault', 'index.json').replace(/\\/g, '/')
        try {
          await git(['check-ignore', '-q', gitPath])
        } catch {
          vaultIgnored = false
          warnings.push('vault/index.json may not be git-ignored. Check your .gitignore.')
        }
      }
    }

    if (!vaultIgnored) {
      errors.push(
        'vault/ is not ignored by git. ' +
          'Ensure "vault/" is listed in .gitignore before installing an update.'
      )
    }

    // ── Derive final flags ─────────────────────────────────────────────────────
    const updateAvailable =
      currentCommit !== '' &&
      latestCommit !== '' &&
      currentCommit !== latestCommit

    const canInstall =
      workingTreeClean && vaultIgnored && updateAvailable && errors.length === 0

    if (!updateAvailable && errors.length === 0) {
      warnings.push('Already up to date.')
    }

    return NextResponse.json({
      ok: true,
      currentCommit,
      latestCommit,
      branch,
      remoteUrl,
      updateAvailable,
      workingTreeClean,
      vaultIgnored,
      canInstall,
      dirtyFiles,
      autoFixableDirtyFiles,
      blockingDirtyFiles,
      onlyAutoFixableChanges,
      warnings,
      errors,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        ok: false,
        errors: [`Unexpected error: ${msg}`],
        warnings: [],
        canInstall: false,
      },
      { status: 500 }
    )
  }
}
