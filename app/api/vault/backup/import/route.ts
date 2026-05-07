import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import AdmZip from 'adm-zip'
import { getVaultRoot } from '@/lib/server/vaultPaths'

const PROJECT_ROOT = /*turbopackIgnore: true*/ process.cwd()

function timestamp(): string {
  return new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
}

/** Reject entries with path-traversal sequences or absolute paths. */
function isUnsafePath(entryName: string): boolean {
  const norm = entryName.replace(/\\/g, '/')
  if (norm.startsWith('/')) return true
  if (/^[a-zA-Z]:/.test(norm)) return true
  return norm.split('/').some((part) => part === '..')
}

/**
 * If every entry in the zip shares the same top-level directory AND that
 * directory contains index.json, return it as the prefix to strip.
 * Otherwise return ''.
 */
function detectRootPrefix(names: string[]): string {
  if (names.length === 0) return ''
  const tops = names.map((n) => n.split('/')[0])
  const first = tops[0]
  if (!first || !tops.every((t) => t === first)) return ''
  const prefix = first + '/'
  return names.some((n) => n === prefix + 'index.json') ? prefix : ''
}

async function pathExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true } catch { return false }
}

export async function POST(request: Request) {
  const ts = timestamp()

  try {
    // ── 1. Parse form data ────────────────────────────────────────────────────
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { ok: false, message: 'Could not read form data.', errors: ['Failed to parse request body.'], warnings: [] },
        { status: 400 }
      )
    }

    const rawFile = formData.get('file')
    if (!rawFile || !(rawFile instanceof File)) {
      return NextResponse.json(
        { ok: false, message: 'No file uploaded.', errors: ['Missing file field in request.'], warnings: [] },
        { status: 400 }
      )
    }
    const file = rawFile

    // ── 2. Validate file type ─────────────────────────────────────────────────
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json(
        { ok: false, message: 'Invalid file type. Only .zip files are accepted.', errors: ['File must be a .zip archive.'], warnings: [] },
        { status: 400 }
      )
    }

    // ── 3. Parse zip ──────────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer())
    let zip: AdmZip
    try {
      zip = new AdmZip(buffer)
    } catch {
      return NextResponse.json(
        { ok: false, message: 'The file is not a valid zip archive.', errors: ['Could not parse zip.'], warnings: [] },
        { status: 400 }
      )
    }

    const entries = zip.getEntries()
    const entryNames = entries.map((e) => e.entryName.replace(/\\/g, '/'))

    // ── 4. Path-traversal check ───────────────────────────────────────────────
    for (const name of entryNames) {
      if (isUnsafePath(name)) {
        return NextResponse.json(
          { ok: false, message: 'Zip contains unsafe paths and cannot be imported.', errors: [`Unsafe path: ${name}`], warnings: [] },
          { status: 400 }
        )
      }
    }

    // ── 5. Detect optional root prefix ────────────────────────────────────────
    const prefix = detectRootPrefix(entryNames)

    // ── 6. Check index.json is present ────────────────────────────────────────
    const hasIndex = entryNames.some((n) => (prefix ? n.slice(prefix.length) : n) === 'index.json')
    if (!hasIndex) {
      return NextResponse.json(
        { ok: false, message: 'This does not look like a vault backup (index.json not found).', errors: ['index.json missing from zip.'], warnings: [] },
        { status: 400 }
      )
    }

    // ── 7. Extract to temp dir ────────────────────────────────────────────────
    const tempDir = path.join(PROJECT_ROOT, '.tmp-vault-imports', ts)
    await fs.mkdir(tempDir, { recursive: true })

    try {
      for (const entry of entries) {
        if (entry.isDirectory) continue
        const rawName = entry.entryName.replace(/\\/g, '/')
        const relativePath = prefix ? rawName.slice(prefix.length) : rawName
        if (!relativePath) continue

        const destPath = path.join(tempDir, relativePath)

        // Final path-traversal guard after join
        const resolvedDest = path.resolve(destPath)
        const resolvedTemp = path.resolve(tempDir)
        if (!resolvedDest.startsWith(resolvedTemp + path.sep)) {
          throw new Error(`Path traversal detected during extraction: ${entry.entryName}`)
        }

        await fs.mkdir(path.dirname(destPath), { recursive: true })
        await fs.writeFile(destPath, entry.getData())
      }

      // ── 8. Validate extracted index.json ────────────────────────────────────
      const extractedIndex = path.join(tempDir, 'index.json')
      try {
        const raw = await fs.readFile(extractedIndex, 'utf-8')
        const parsed = JSON.parse(raw) as { assets?: unknown }
        if (!Array.isArray(parsed.assets)) throw new Error('assets array missing')
      } catch (e) {
        await fs.rm(tempDir, { recursive: true, force: true })
        return NextResponse.json(
          {
            ok: false,
            message: 'The backup index.json is invalid or corrupt.',
            errors: [e instanceof Error ? e.message : 'Invalid index.json'],
            warnings: [],
          },
          { status: 400 }
        )
      }

      // ── 9. Backup current vault ──────────────────────────────────────────────
      const vaultRoot = getVaultRoot()
      const vaultExisted = await pathExists(vaultRoot)
      let backupPath: string | undefined

      if (vaultExisted) {
        const backupBase = path.join(PROJECT_ROOT, 'vault-import-backups')
        await fs.mkdir(backupBase, { recursive: true })
        const backupDest = path.join(backupBase, `vault-before-import-${ts}`)
        await fs.rename(vaultRoot, backupDest)
        backupPath = `vault-import-backups/vault-before-import-${ts}`
      }

      // ── 10. Place new vault ──────────────────────────────────────────────────
      await fs.rename(tempDir, vaultRoot)

      const warnings: string[] = vaultExisted
        ? []
        : ['No existing vault was found. Imported into a fresh vault location.']

      return NextResponse.json({
        ok: true,
        message: 'Vault backup imported successfully.',
        backupPath,
        errors: [],
        warnings,
      })
    } catch (err) {
      // Clean up temp dir on any mid-operation failure
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
      throw err
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { ok: false, message: `Import failed: ${message}`, errors: [message], warnings: [] },
      { status: 500 }
    )
  }
}
