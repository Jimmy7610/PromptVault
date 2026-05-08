import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { Collection } from '@/types'
import { getVaultRoot } from '@/lib/server/vaultPaths'

const COLLECTIONS_FILE = 'collections/index.json'

function collectionsFilePath(): string {
  return path.join(getVaultRoot(), COLLECTIONS_FILE)
}

/** GET /api/vault/collections — return all saved collections */
export async function GET() {
  try {
    const filePath = collectionsFilePath()
    try {
      const raw = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(raw) as { collections: Collection[] }
      return NextResponse.json({ collections: data.collections ?? [] })
    } catch {
      // File doesn't exist yet — return empty list
      return NextResponse.json({ collections: [] })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** POST /api/vault/collections — overwrite all collections */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { collections: Collection[] }
    if (!Array.isArray(body.collections)) {
      return NextResponse.json({ error: 'collections must be an array' }, { status: 400 })
    }

    const filePath = collectionsFilePath()
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    const payload = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      collections: body.collections,
    }

    const tmp = filePath + '.tmp'
    await fs.writeFile(tmp, JSON.stringify(payload, null, 2), 'utf-8')
    await fs.rename(tmp, filePath)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
