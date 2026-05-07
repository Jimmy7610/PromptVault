import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execFileAsync = promisify(execFile)

const PROJECT_ROOT = process.cwd()
const EXPECTED_REMOTE = 'https://github.com/Jimmy7610/PromptVault.git'
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function git(args: string[]) {
  return execFileAsync('git', args, { cwd: PROJECT_ROOT, timeout: 30_000 })
}

function npm(args: string[], timeoutMs = 300_000) {
  return execFileAsync(NPM, args, { cwd: PROJECT_ROOT, timeout: timeoutMs })
}

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

function lastLines(text: string, n: number): string {
  return text
    .split('\n')
    .filter((l) => l.trim())
    .slice(-n)
    .join('\n')
}

export async function POST() {
  const logs: string[] = []
  const errors: string[] = []

  const abort = (reason: string, extra: string[] = []) =>
    NextResponse.json({
      ok: false,
      success: false,
      errors: [reason, ...extra],
      logs: [...logs, `ABORT: ${reason}`],
      restartRequired: false,
    })

  try {
    logs.push('Running pre-install safety checks...')

    // ── 1. Git repo ────────────────────────────────────────────────────────────
    try {
      await git(['rev-parse', '--git-dir'])
    } catch {
      return abort('Not a git repository.')
    }

    // ── 2. Remote matches expected ─────────────────────────────────────────────
    let remoteUrl = ''
    try {
      const { stdout } = await git(['remote', 'get-url', 'origin'])
      remoteUrl = stdout.trim()
    } catch {
      return abort(`No remote origin found. Expected: ${EXPECTED_REMOTE}`)
    }

    if (remoteUrl !== EXPECTED_REMOTE) {
      return abort(
        `Remote origin is "${remoteUrl}", expected "${EXPECTED_REMOTE}". ` +
          'Refusing to update from an unexpected remote.'
      )
    }
    logs.push(`✓ Remote verified: ${EXPECTED_REMOTE}`)

    // ── 3. Fetch to get fresh refs ─────────────────────────────────────────────
    try {
      await git(['fetch', 'origin', 'main'])
      logs.push('✓ Fetched origin/main')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return abort(`Could not fetch from origin: ${msg}`)
    }

    // ── 4. Check update is actually needed ─────────────────────────────────────
    let currentCommit = ''
    let latestCommit = ''
    try {
      currentCommit = (await git(['rev-parse', '--short', 'HEAD'])).stdout.trim()
      latestCommit = (await git(['rev-parse', '--short', 'origin/main'])).stdout.trim()
    } catch {
      // continue — if we can't read commits, pull will still work or fail cleanly
    }

    if (currentCommit && latestCommit && currentCommit === latestCommit) {
      logs.push('Already up to date. No update needed.')
      return NextResponse.json({
        ok: true,
        success: false,
        errors: [],
        logs,
        restartRequired: false,
      })
    }
    if (currentCommit && latestCommit) {
      logs.push(`Current: ${currentCommit}  →  Latest: ${latestCommit}`)
    }

    // ── 5. Working tree clean (vault/ excluded) ────────────────────────────────
    let workingTreeClean = false
    try {
      const { stdout } = await git(['status', '--porcelain'])
      workingTreeClean = nonVaultDirtyLines(stdout).length === 0
    } catch {
      // treat as dirty
    }

    if (!workingTreeClean) {
      return abort(
        'Working tree has uncommitted changes. ' +
          'Commit, stash, or discard local code changes before updating.'
      )
    }
    logs.push('✓ Working tree is clean')

    // ── 6. vault/ is git-ignored ───────────────────────────────────────────────
    let vaultIgnored = false
    try {
      await git(['check-ignore', '-q', 'vault'])
      vaultIgnored = true
    } catch {
      // not ignored
    }

    if (vaultIgnored) {
      const vaultIndexPath = path.join(PROJECT_ROOT, 'vault', 'index.json')
      if (fs.existsSync(vaultIndexPath)) {
        const gitPath = path.join('vault', 'index.json').replace(/\\/g, '/')
        try {
          await git(['check-ignore', '-q', gitPath])
        } catch {
          vaultIgnored = false
        }
      }
    }

    if (!vaultIgnored) {
      return abort(
        'vault/ is not git-ignored. Ensure "vault/" is in .gitignore before updating.'
      )
    }
    logs.push('✓ vault/ is git-ignored — local vault data is safe')

    // ── All safety checks passed ───────────────────────────────────────────────
    logs.push('─'.repeat(48))
    logs.push('All safety checks passed. Starting update...')
    logs.push('─'.repeat(48))

    // ── Step 1: git pull --ff-only origin main ─────────────────────────────────
    logs.push('Step 1 / 3: git pull --ff-only origin main')
    try {
      const { stdout, stderr } = await git(['pull', '--ff-only', 'origin', 'main'])
      const out = (stdout + stderr).trim()
      logs.push(out || '(no output)')
      logs.push('✓ git pull completed')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logs.push(`✗ git pull failed: ${msg}`)
      errors.push(`git pull --ff-only failed: ${msg}`)
      return NextResponse.json({ ok: false, success: false, errors, logs, restartRequired: false })
    }

    // ── Step 2: npm install ────────────────────────────────────────────────────
    logs.push('─'.repeat(48))
    logs.push('Step 2 / 3: npm install')
    try {
      const { stdout, stderr } = await npm(['install'])
      const preview = lastLines(stdout + stderr, 12)
      logs.push(preview || '(no output)')
      logs.push('✓ npm install completed')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logs.push(`✗ npm install failed: ${lastLines(msg, 8)}`)
      errors.push(`npm install failed: ${msg}`)
      return NextResponse.json({ ok: false, success: false, errors, logs, restartRequired: false })
    }

    // ── Step 3: npm run build ──────────────────────────────────────────────────
    logs.push('─'.repeat(48))
    logs.push('Step 3 / 3: npm run build')
    try {
      const { stdout, stderr } = await npm(['run', 'build'], 360_000)
      const preview = lastLines(stdout + stderr, 20)
      logs.push(preview || '(no output)')
      logs.push('✓ Build completed')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logs.push(`✗ Build failed:\n${lastLines(msg, 20)}`)
      errors.push(
        'Build failed after update. App code was updated but the build did not complete. ' +
          'See logs for details. Restart the app (npm run dev) to apply changes and investigate.'
      )
      return NextResponse.json({ ok: false, success: false, errors, logs, restartRequired: false })
    }

    // ── Success ────────────────────────────────────────────────────────────────
    logs.push('─'.repeat(48))
    logs.push('✓ Update installed successfully.')
    logs.push('Please restart PromptVault to use the new version.')

    return NextResponse.json({
      ok: true,
      success: true,
      errors: [],
      logs,
      restartRequired: true,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        ok: false,
        success: false,
        errors: [`Unexpected error: ${msg}`],
        logs: [...logs, `ABORT: Unexpected error — ${msg}`],
        restartRequired: false,
      },
      { status: 500 }
    )
  }
}
