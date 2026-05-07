import { NextRequest, NextResponse } from 'next/server'
import { readVaultIndex } from '@/lib/server/vaultIndex'
import { readAssetFile, resolveAssetPath, writeAssetFile } from '@/lib/server/vaultFiles'
import { upsertIndexAsset } from '@/lib/server/vaultIndex'
import { Asset, VaultIndexAsset } from '@/types'

/** GET /api/vault/assets — list index assets, optionally with full content */
export async function GET(request: NextRequest) {
  try {
    const full = request.nextUrl.searchParams.get('full') === 'true'
    const index = await readVaultIndex()

    if (!full) {
      return NextResponse.json({ assets: index.assets })
    }

    // Load full content for each asset
    const assets: Partial<Asset>[] = []
    for (const entry of index.assets) {
      try {
        const asset = await readAssetFile(entry.path)
        assets.push(asset)
      } catch {
        // Skip files that can't be read; keep index entry intact
      }
    }
    return NextResponse.json({ assets })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** POST /api/vault/assets — create a new asset file and add to index */
export async function POST(request: Request) {
  try {
    const asset = (await request.json()) as Asset

    if (!asset.id || !asset.type || !asset.title) {
      return NextResponse.json({ error: 'id, type, and title are required' }, { status: 400 })
    }

    const relativePath = await resolveAssetPath(asset)
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
