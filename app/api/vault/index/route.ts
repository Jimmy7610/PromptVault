import { NextResponse } from 'next/server'
import { readVaultIndex, writeVaultIndex } from '@/lib/server/vaultIndex'
import { VaultIndex } from '@/types'

export async function GET() {
  try {
    const index = await readVaultIndex()
    return NextResponse.json(index)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as VaultIndex
    await writeVaultIndex(body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
