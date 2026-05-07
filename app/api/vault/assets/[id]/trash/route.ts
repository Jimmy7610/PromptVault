import { NextRequest, NextResponse } from 'next/server'
import { markAssetTrashed } from '@/lib/server/vaultIndex'

type Params = { params: Promise<{ id: string }> }

/** POST /api/vault/assets/[id]/trash — mark asset as trashed in index */
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await markAssetTrashed(id, new Date().toISOString())
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
