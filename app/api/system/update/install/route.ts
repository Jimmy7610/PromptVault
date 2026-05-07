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

// Base shape for all responses so callers always get the step flags
function baseResult(overrides: object) {
  return {
    gitUpdated: false,
    npmInstallOk: false,
    buildOk: false,
    partialSuccess: false,
    restartRequired: false,
    status: 'not_started' as const,
    message: '',
    ...overrides,
  }
}

export async function POST() {
  const logs: string[] = []
  const errors: string[] = []

  const abortEarly = (reason: string, extra: string[] = []) =>
    NextResponse.json({
      ok: false,
      success: false,
      ...baseResult({ status: 'failed', message: reason }),
      errors: [reason, ...extra],
      logs: [...logs, `ABORT: ${reason}`],
    })

  try {
    logs.push('Running pre-install safety checks...')

    // ── 1. Git repo ────────────────────────────────────────────────────────────
    try {
      await git(['rev-parse', '--git-dir'])
    } catch {
      return abortEarly('Not a git repository.')
    }

    // ── 2. Remote matches expected ─────────────────────────────────────────────
    let remoteUrl = ''
    try {
      const { stdout } = await git(['remote', 'get-url', 'origin'])
      remoteUrl = stdout.trim()
    } catch {
      return abortEarly(`No remote origin found. Expected: ${EXPECTED_REMOTE}`)
    }

    if (remoteUrl !== EXPECTED_REMOTE) {
      return abortEarly(
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
      return abortEarly(`Could not fetch from origin: ${msg}`)
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
        ...baseResult({ status: 'not_started', message: 'Already up to date.' }),
        errors: [],
        logs,
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
      return abortEarly(
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
      return abortEarly(
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
    let gitUpdated = false
    try {
      const { stdout, stderr } = await git(['pull', '--ff-only', 'origin', 'main'])
      const out = (stdout + stderr).trim()
      logs.push(out || '(no output)')
      logs.push('✓ git pull completed')
      gitUpdated = true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logs.push(`✗ git pull failed: ${msg}`)
      errors.push(`git pull --ff-only failed: ${msg}`)
      return NextResponse.json({
        ok: false,
        success: false,
        ...baseResult({
          gitUpdated: false,
          status: 'failed',
          message: 'Update could not be downloaded.',
        }),
        errors,
        logs,
      })
    }

    // ── Step 2: npm install ────────────────────────────────────────────────────
    logs.push('─'.repeat(48))
    logs.push('Step 2 / 3: npm install')
    let npmInstallOk = false
    try {
      const { stdout, stderr } = await npm(['install'])
      const preview = lastLines(stdout + stderr, 12)
      logs.push(preview || '(no output)')
      logs.push('✓ npm install completed')
      npmInstallOk = true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logs.push(`✗ npm install failed: ${lastLines(msg, 8)}`)
      errors.push(`npm install failed — see logs for details`)
      return NextResponse.json({
        ok: false,
        success: false,
        ...baseResult({
          gitUpdated: true,
          npmInstallOk: false,
          partialSuccess: true,
          restartRequired: true,
          status: 'partial',
          message:
            'Update downloaded, but npm install failed. Restart PromptVault or run npm install manually.',
        }),
        errors,
        logs,
      })
    }

    // ── Step 3: npm run build ──────────────────────────────────────────────────
    logs.push('─'.repeat(48))
    logs.push('Step 3 / 3: npm run build')
    let buildOk = false
    try {
      const { stdout, stderr } = await npm(['run', 'build'], 360_000)
      const preview = lastLines(stdout + stderr, 20)
      logs.push(preview || '(no output)')
      logs.push('✓ Build completed')
      buildOk = true
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logs.push(`✗ Build failed:\n${lastLines(msg, 20)}`)
      errors.push(`Build failed — see logs for details`)
      return NextResponse.json({
        ok: false,
        success: false,
        ...baseResult({
          gitUpdated: true,
          npmInstallOk: true,
          buildOk: false,
          partialSuccess: true,
          restartRequired: true,
          status: 'partial',
          message:
            'Update downloaded, but build verification failed. Restart PromptVault or run npm run build manually.',
        }),
        errors,
        logs,
      })
    }

    // ── Success ────────────────────────────────────────────────────────────────
    logs.push('─'.repeat(48))
    logs.push('✓ Update installed successfully.')
    logs.push('Please restart PromptVault to use the new version.')

    // Satisfy TypeScript: both flags are true here
    void gitUpdated
    void npmInstallOk
    void buildOk

    return NextResponse.json({
      ok: true,
      success: true,
      gitUpdated: true,
      npmInstallOk: true,
      buildOk: true,
      partialSuccess: false,
      restartRequired: true,
      status: 'built',
      message: 'Update installed successfully. Restart PromptVault.',
      errors: [],
      logs,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        ok: false,
        success: false,
        ...baseResult({
          status: 'failed',
          message: `Unexpected error: ${msg}`,
        }),
        errors: [`Unexpected error: ${msg}`],
        logs: [...logs, `ABORT: Unexpected error — ${msg}`],
      },
      { status: 500 }
    )
  }
}
