import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { safeJoinVaultPath } from '@/lib/server/vaultPaths'

const ID_RE = /^[a-zA-Z0-9_-]{1,64}$/

function validateId(id: string): boolean {
  return ID_RE.test(id)
}

/** POST /api/vault/versions/[assetId]  — write a version snapshot file */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params
    if (!validateId(assetId)) {
      return NextResponse.json({ ok: false, error: 'Invalid asset ID' }, { status: 400 })
    }

    const body = await req.json()
    if (!body?.id || !body?.createdAt) {
      return NextResponse.json({ ok: false, error: 'Invalid version payload' }, { status: 400 })
    }

    const dir = safeJoinVaultPath(`versions/${assetId}`)
    await fs.mkdir(dir, { recursive: true })

    // Use the ISO timestamp as filename, sanitised for filesystem
    const ts = body.createdAt.replace(/[:.]/g, '-').replace(/[^a-zA-Z0-9_-]/g, '')
    const file = path.join(dir, `${ts}.json`)
    await fs.writeFile(file, JSON.stringify(body, null, 2), 'utf-8')

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
