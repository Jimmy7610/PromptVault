import { NextRequest, NextResponse } from 'next/server'
import { findIndexAssetById, upsertIndexAsset, removeIndexAsset } from '@/lib/server/vaultIndex'
import { readAssetFile, writeAssetFile, createBackup, moveAssetToDeleted, resolveAssetPath } from '@/lib/server/vaultFiles'
import { Asset, VaultIndexAsset } from '@/types'

type Params = { params: Promise<{ id: string }> }

/** GET /api/vault/assets/[id] — load full asset from file */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const entry = await findIndexAssetById(id)
    if (!entry) {
      return NextResponse.json({ error: 'Asset not found in index' }, { status: 404 })
    }
    const asset = await readAssetFile(entry.path)
    return NextResponse.json({ asset })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** PUT /api/vault/assets/[id] — update asset file (backup first) and update index */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const asset = (await request.json()) as Asset

    if (asset.id !== id) {
      return NextResponse.json({ error: 'ID mismatch' }, { status: 400 })
    }

    // Find existing path or resolve a new one
    const existing = await findIndexAssetById(id)
    const relativePath = existing?.path ?? await resolveAssetPath(asset)

    // Backup before overwrite
    await createBackup(relativePath)
    await writeAssetFile(asset, relativePath)

    const indexEntry: VaultIndexAsset = {
      id: asset.id,
      type: asset.type,
      title: asset.title,
      description: asset.description ?? '',
      path: relativePath,
      tags: asset.tags ?? [],
      tools: asset.tools ?? [],
      favorite: asset.isFavorite ?? false,
      version: asset.version ?? '1.0.0',
      visibility: asset.visibility ?? 'private',
      status: asset.status ?? 'active',
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      trashedAt: asset.trashedAt ?? null,
      usageCount: asset.usageCount ?? 0,
      copyCount: asset.copyCount ?? 0,
      language: asset.language,
    }
    await upsertIndexAsset(indexEntry)

    return NextResponse.json({ ok: true, path: relativePath })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

/** DELETE /api/vault/assets/[id] — move file to .deleted, remove from index */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const entry = await findIndexAssetById(id)
    if (!entry) {
      // Not in index — just confirm ok
      return NextResponse.json({ ok: true })
    }
    await moveAssetToDeleted(entry.path)
    await removeIndexAsset(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
