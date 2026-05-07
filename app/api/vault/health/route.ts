import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getVaultRoot } from '@/lib/server/vaultPaths'

// Top-level vault directories we require to exist
const REQUIRED_FOLDERS = [
  'agents',
  'prompts',
  'markdown',
  'code',
  'workflows',
  'templates',
  'collections',
  'images',
  'exports',
  'backups',
  '.deleted',
]

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

export async function GET() {
  const vaultRoot = getVaultRoot()
  const warnings: string[] = []
  const errors: string[] = []

  // ── 1. Vault folder ────────────────────────────────────────────────────────
  const vaultExists = await exists(vaultRoot)
  if (!vaultExists) {
    errors.push('Vault folder does not exist. Run Initialize Vault to create it.')
    return NextResponse.json({
      ok: false,
      status: 'error',
      vaultExists: false,
      indexExists: false,
      indexValid: false,
      requiredFolders: REQUIRED_FOLDERS.map((name) => ({ name, exists: false })),
      assetCount: 0,
      trashedCount: 0,
      missingFiles: [],
      duplicateIds: [],
      warnings,
      errors,
    })
  }

  // ── 2. index.json ──────────────────────────────────────────────────────────
  const indexPath = path.join(vaultRoot, 'index.json')
  const indexExists = await exists(indexPath)

  if (!indexExists) {
    errors.push('index.json does not exist. Run Initialize Vault or Rebuild Vault Index.')
  }

  // ── 3. Required folders ────────────────────────────────────────────────────
  const requiredFolders = await Promise.all(
    REQUIRED_FOLDERS.map(async (name) => ({
      name,
      exists: await exists(path.join(vaultRoot, name)),
    }))
  )
  const missingFolders = requiredFolders.filter((f) => !f.exists)
  if (missingFolders.length > 0) {
    warnings.push(
      `${missingFolders.length} required folder${missingFolders.length === 1 ? '' : 's'} missing: ${missingFolders.map((f) => f.name).join(', ')}. Run Initialize Vault to create them.`
    )
  }

  // ── 4. Parse index.json ────────────────────────────────────────────────────
  let indexValid = false
  let assetCount = 0
  let trashedCount = 0
  let missingFiles: string[] = []
  let duplicateIds: string[] = []

  if (indexExists) {
    try {
      const raw = await fs.readFile(indexPath, 'utf-8')
      const index = JSON.parse(raw) as {
        assets?: Array<{ id?: string; path?: string; trashedAt?: string | null; status?: string }>
      }

      if (!Array.isArray(index.assets)) {
        errors.push('index.json is missing the assets array. The file may be corrupted.')
      } else {
        indexValid = true
        const assets = index.assets
        assetCount = assets.length
        trashedCount = assets.filter((a) => a.trashedAt || a.status === 'trash').length

        // ── 5. Missing file references ─────────────────────────────────────
        const checked = await Promise.all(
          assets.map(async (a) => {
            if (!a.path) return null
            const abs = path.join(vaultRoot, a.path.replace(/\//g, path.sep))
            const fileExists = await exists(abs)
            return fileExists ? null : a.path
          })
        )
        missingFiles = checked.filter((p): p is string => p !== null)
        if (missingFiles.length > 0) {
          warnings.push(
            `${missingFiles.length} index ${missingFiles.length === 1 ? 'entry references a' : 'entries reference'} missing file${missingFiles.length === 1 ? '' : 's'}. Run Rebuild Vault Index to resync.`
          )
        }

        // ── 6. Duplicate IDs ───────────────────────────────────────────────
        const idCounts = new Map<string, number>()
        for (const a of assets) {
          if (a.id) idCounts.set(a.id, (idCounts.get(a.id) ?? 0) + 1)
        }
        duplicateIds = [...idCounts.entries()]
          .filter(([, c]) => c > 1)
          .map(([id]) => id)
        if (duplicateIds.length > 0) {
          warnings.push(
            `${duplicateIds.length} duplicate asset ID${duplicateIds.length === 1 ? '' : 's'} found in index. Run Rebuild Vault Index to fix.`
          )
        }
      }
    } catch {
      errors.push('index.json could not be parsed as valid JSON. The file may be corrupted.')
    }
  }

  // ── Overall status ─────────────────────────────────────────────────────────
  const status: 'healthy' | 'warning' | 'error' =
    errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'healthy'

  return NextResponse.json({
    ok: errors.length === 0,
    status,
    vaultExists,
    indexExists,
    indexValid,
    requiredFolders,
    assetCount,
    trashedCount,
    missingFiles,
    duplicateIds,
    warnings,
    errors,
  })
}
