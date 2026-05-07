import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const PROJECT_ROOT = process.cwd()

// Hardcoded whitelist — these are the only files this route will ever touch.
// No user input is accepted as filenames. No other files are restored.
const AUTO_FIXABLE_FILES = ['next-env.d.ts', 'package-lock.json'] as const

function git(args: string[]) {
  return execFileAsync('git', args, { cwd: PROJECT_ROOT, timeout: 30_000 })
}

export async function POST() {
  const logs: string[] = []
  const errors: string[] = []

  try {
    // Verify this is a git repo before doing anything
    try {
      await git(['rev-parse', '--git-dir'])
    } catch {
      return NextResponse.json({
        ok: false,
        success: false,
        errors: ['Not a git repository.'],
        logs: ['ABORT: Not a git repository.'],
      })
    }

    logs.push(`Restoring generated/install files: ${AUTO_FIXABLE_FILES.join(', ')}`)
    logs.push('(vault/ and your saved assets are not touched)')

    // Restore each file individually so a missing/untracked file does not
    // abort the whole operation — we simply skip it with a note.
    for (const file of AUTO_FIXABLE_FILES) {
      try {
        await git(['restore', '--', file])
        logs.push(`✓ Restored: ${file}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        // Not an error — the file may not be modified or may not exist in git.
        logs.push(`(skipped ${file}: ${msg.split('\n')[0].trim()})`)
      }
    }

    logs.push('Done. Re-run "Check for updates" to see the updated working tree status.')

    return NextResponse.json({ ok: true, success: true, logs, errors })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        ok: false,
        success: false,
        errors: [`Unexpected error: ${msg}`],
        logs: [...logs, `ABORT: ${msg}`],
      },
      { status: 500 }
    )
  }
}
