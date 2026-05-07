import { Asset, VaultIndex, VaultIndexAsset, VaultHealthResult, VaultImportResult } from '@/types'

// ── Generic fetch helper ──────────────────────────────────────────────────────

async function vaultFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, options)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data as T
}

// ── Vault lifecycle ───────────────────────────────────────────────────────────

/** Create vault folder structure and index.json if missing. */
export async function initVault(): Promise<{ ok: boolean; vaultRoot?: string; error?: string }> {
  try {
    return await vaultFetch('/api/vault/init', { method: 'POST' })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Get the raw vault index (no file content). */
export async function getVaultIndex(): Promise<VaultIndex> {
  return vaultFetch('/api/vault/index')
}

/** Get all assets from index, optionally including full file content. */
export async function getVaultAssets(full = false): Promise<Partial<Asset>[]> {
  const data = await vaultFetch<{ assets: Partial<Asset>[] }>(
    `/api/vault/assets${full ? '?full=true' : ''}`
  )
  return data.assets ?? []
}

/** Load full content for a single asset by ID. */
export async function getVaultAsset(id: string): Promise<Partial<Asset> | null> {
  try {
    const data = await vaultFetch<{ asset: Partial<Asset> }>(`/api/vault/assets/${id}`)
    return data.asset
  } catch {
    return null
  }
}

// ── Asset CRUD ────────────────────────────────────────────────────────────────

/** Write a new asset file and add it to the index. */
export async function createVaultAsset(
  asset: Asset
): Promise<{ ok: boolean; path?: string; error?: string }> {
  try {
    return await vaultFetch('/api/vault/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Update an existing asset file (creates a backup first) and refresh index. */
export async function updateVaultAsset(
  asset: Asset
): Promise<{ ok: boolean; error?: string }> {
  try {
    return await vaultFetch(`/api/vault/assets/${asset.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Mark an asset as trashed in index.json (file stays in place). */
export async function trashVaultAsset(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    return await vaultFetch(`/api/vault/assets/${id}/trash`, { method: 'POST' })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Clear trashedAt for an asset in index.json. */
export async function restoreVaultAsset(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    return await vaultFetch(`/api/vault/assets/${id}/restore`, { method: 'POST' })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/** Move asset file to vault/.deleted and remove from index. */
export async function deleteVaultAsset(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    return await vaultFetch(`/api/vault/assets/${id}`, { method: 'DELETE' })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ── Bulk operations ───────────────────────────────────────────────────────────

/**
 * Write every asset in the provided array to the vault.
 * Skips trashed assets by default.
 * Returns count of successes and any per-asset errors.
 */
export async function syncAssetsToVault(
  assets: Asset[]
): Promise<{ ok: boolean; saved: number; errors: string[] }> {
  const errors: string[] = []
  let saved = 0

  for (const asset of assets) {
    if (asset.status === 'trash') continue
    const result = await createVaultAsset(asset)
    if (result.ok) {
      saved++
    } else {
      errors.push(`${asset.title}: ${result.error ?? 'unknown'}`)
    }
  }

  return { ok: errors.length === 0, saved, errors }
}

/** Rebuild index.json by scanning vault folder structure. */
export async function rebuildVaultIndex(): Promise<{ ok: boolean; count?: number; error?: string }> {
  try {
    return await vaultFetch('/api/vault/rebuild-index', { method: 'POST' })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// ── Backup / transfer ─────────────────────────────────────────────────────────

/**
 * Request a zip of the vault from the server and trigger a browser download.
 * No data leaves the local machine.
 */
export async function exportVaultBackup(): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/vault/backup/export')
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string }
      return { ok: false, error: data.error ?? `HTTP ${res.status}` }
    }
    const cd = res.headers.get('Content-Disposition') ?? ''
    const match = cd.match(/filename="([^"]+)"/)
    const filename = match?.[1] ?? 'promptvault-vault-backup.zip'

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Export failed.' }
  }
}

/**
 * Upload a zip file to the server for import.
 * The server validates, backs up the current vault, then replaces it.
 */
export async function importVaultBackup(file: File): Promise<VaultImportResult> {
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/vault/backup/import', { method: 'POST', body: form })
    return (await res.json()) as VaultImportResult
  } catch (err) {
    return {
      ok: false,
      message: 'Import request failed.',
      errors: [err instanceof Error ? err.message : 'Unknown error'],
      warnings: [],
    }
  }
}

/** Run a read-only health check on the vault folder structure and index. */
export async function healthCheckVault(): Promise<VaultHealthResult> {
  try {
    return await vaultFetch<VaultHealthResult>('/api/vault/health')
  } catch (err) {
    return {
      ok: false,
      status: 'error',
      vaultExists: false,
      indexExists: false,
      indexValid: false,
      requiredFolders: [],
      assetCount: 0,
      trashedCount: 0,
      missingFiles: [],
      duplicateIds: [],
      warnings: [],
      errors: [err instanceof Error ? err.message : 'Health check request failed.'],
    }
  }
}
