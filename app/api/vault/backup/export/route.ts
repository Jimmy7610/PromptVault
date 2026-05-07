import { NextResponse } from 'next/server'
import fs from 'fs'
import AdmZip from 'adm-zip'
import { getVaultRoot } from '@/lib/server/vaultPaths'

function backupFilename(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`
  return `promptvault-vault-backup-${date}-${time}.zip`
}

export async function GET() {
  const vaultRoot = getVaultRoot()

  if (!fs.existsSync(vaultRoot)) {
    return NextResponse.json({ error: 'Vault is not initialized yet.' }, { status: 400 })
  }

  try {
    const zip = new AdmZip()
    // addLocalFolder adds all contents of vaultRoot at the zip root (no extra wrapper folder)
    zip.addLocalFolder(vaultRoot, '')
    const buffer = zip.toBuffer()

    const filename = backupFilename()

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Export failed: ${message}` }, { status: 500 })
  }
}
