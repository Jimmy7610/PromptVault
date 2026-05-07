import { NextResponse } from 'next/server'
import { ensureVaultStructure, getVaultRoot } from '@/lib/server/vaultPaths'

export async function POST() {
  try {
    await ensureVaultStructure()
    return NextResponse.json({ ok: true, vaultRoot: getVaultRoot() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
