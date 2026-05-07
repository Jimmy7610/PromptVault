// Server-only — only import from API routes
import path from 'path'
import fs from 'fs/promises'
import { VaultIndex, VaultIndexAsset } from '@/types'
import { getVaultRoot } from './vaultPaths'

function getIndexPath(): string {
  return path.join(getVaultRoot(), 'index.json')
}

const EMPTY_INDEX: VaultIndex = {
  version: '1.0.0',
  updatedAt: new Date().toISOString(),
  assets: [],
}

export async function readVaultIndex(): Promise<VaultIndex> {
  try {
    const raw = await fs.readFile(getIndexPath(), 'utf-8')
    return JSON.parse(raw) as VaultIndex
  } catch {
    return { ...EMPTY_INDEX, updatedAt: new Date().toISOString() }
  }
}

/** Atomically writes index.json via a temp file + rename. */
export async function writeVaultIndex(index: VaultIndex): Promise<void> {
  const indexPath = getIndexPath()
  const tmp = indexPath + '.tmp'
  const updated: VaultIndex = { ...index, updatedAt: new Date().toISOString() }
  await fs.writeFile(tmp, JSON.stringify(updated, null, 2), 'utf-8')
  await fs.rename(tmp, indexPath)
}

/** Insert or update a single asset entry in the index. */
export async function upsertIndexAsset(asset: VaultIndexAsset): Promise<void> {
  const index = await readVaultIndex()
  const i = index.assets.findIndex((a) => a.id === asset.id)
  if (i >= 0) {
    index.assets[i] = asset
  } else {
    index.assets.push(asset)
  }
  await writeVaultIndex(index)
}

export async function removeIndexAsset(id: string): Promise<void> {
  const index = await readVaultIndex()
  index.assets = index.assets.filter((a) => a.id !== id)
  await writeVaultIndex(index)
}

export async function markAssetTrashed(id: string, trashedAt: string): Promise<void> {
  const index = await readVaultIndex()
  const asset = index.assets.find((a) => a.id === id)
  if (asset) {
    asset.trashedAt = trashedAt
    asset.status = 'trash'
    await writeVaultIndex(index)
  }
}

export async function unmarkAssetTrashed(id: string): Promise<void> {
  const index = await readVaultIndex()
  const asset = index.assets.find((a) => a.id === id)
  if (asset) {
    asset.trashedAt = null
    asset.status = 'active'
    await writeVaultIndex(index)
  }
}

export async function findIndexAssetById(id: string): Promise<VaultIndexAsset | null> {
  const index = await readVaultIndex()
  return index.assets.find((a) => a.id === id) ?? null
}
