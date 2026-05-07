import { NextResponse } from 'next/server'
import { scanVaultForAssets } from '@/lib/server/vaultFiles'
import { readVaultIndex, writeVaultIndex } from '@/lib/server/vaultIndex'

/** POST /api/vault/rebuild-index — scan vault folders and rebuild index.json */
export async function POST() {
  try {
    const scanned = await scanVaultForAssets()
    const index = await readVaultIndex()
    index.assets = scanned
    await writeVaultIndex(index)
    return NextResponse.json({ ok: true, count: scanned.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
