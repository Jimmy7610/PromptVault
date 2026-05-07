import { NextRequest, NextResponse } from 'next/server'
import { unmarkAssetTrashed } from '@/lib/server/vaultIndex'

type Params = { params: Promise<{ id: string }> }

/** POST /api/vault/assets/[id]/restore — clear trashedAt in index */
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await unmarkAssetTrashed(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
