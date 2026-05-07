import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { getVaultRoot, safeJoinVaultPath, toVaultRelative } from '@/lib/server/vaultPaths'

const ALLOWED_MIME: Record<string, string> = {
  'image/png':  '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
}
const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

interface ImageMeta {
  assetId: string
  imageFileName: string
  imageMimeType: string
  imageSize: number
  imageUploadedAt: string
}

function validateId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 64
}

function imageDir(assetId: string): string {
  return safeJoinVaultPath(`images/${assetId}`)
}

async function readMeta(assetId: string): Promise<ImageMeta | null> {
  try {
    const raw = await fs.readFile(path.join(imageDir(assetId), 'metadata.json'), 'utf-8')
    return JSON.parse(raw) as ImageMeta
  } catch {
    return null
  }
}

type Params = { params: Promise<{ assetId: string }> }

/** POST — upload or replace attached image */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { assetId } = await params
    if (!validateId(assetId)) {
      return NextResponse.json({ ok: false, error: 'Invalid asset ID' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
    }

    const ext = ALLOWED_MIME[file.type]
    if (!ext) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported file type. Use PNG, JPG, or WebP.' },
        { status: 400 }
      )
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'File too large. Maximum is 20 MB.' },
        { status: 400 }
      )
    }

    const dir = imageDir(assetId)
    await fs.mkdir(dir, { recursive: true })

    const imageFileName = `original${ext}`
    const filePath = path.join(dir, imageFileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    const uploadedAt = new Date().toISOString()
    const meta: ImageMeta = {
      assetId,
      imageFileName,
      imageMimeType: file.type,
      imageSize: file.size,
      imageUploadedAt: uploadedAt,
    }
    await fs.writeFile(
      path.join(dir, 'metadata.json'),
      JSON.stringify(meta, null, 2),
      'utf-8'
    )

    const imagePath = toVaultRelative(filePath)

    return NextResponse.json({
      ok: true,
      imagePath,
      imageFileName,
      imageMimeType: file.type,
      imageSize: file.size,
      imageUploadedAt: uploadedAt,
    })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

/** GET — serve the attached image file */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { assetId } = await params
    if (!validateId(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 })
    }

    const meta = await readMeta(assetId)
    if (!meta) {
      return NextResponse.json({ error: 'No image attached' }, { status: 404 })
    }

    const filePath = path.join(imageDir(assetId), meta.imageFileName)
    const buffer = await fs.readFile(filePath)

    return new Response(buffer, {
      headers: {
        'Content-Type': meta.imageMimeType,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Not found' },
      { status: 500 }
    )
  }
}

/** DELETE — move image folder to vault/.deleted/images/ */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { assetId } = await params
    if (!validateId(assetId)) {
      return NextResponse.json({ ok: false, error: 'Invalid asset ID' }, { status: 400 })
    }

    const dir = imageDir(assetId)
    try {
      await fs.access(dir)
    } catch {
      return NextResponse.json({ ok: true }) // already gone
    }

    const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
    const deletedBase = path.join(getVaultRoot(), '.deleted', 'images')
    await fs.mkdir(deletedBase, { recursive: true })
    await fs.rename(dir, path.join(deletedBase, `${assetId}-${ts}`))

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Delete failed' },
      { status: 500 }
    )
  }
}
