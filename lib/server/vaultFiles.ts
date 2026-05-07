// Server-only — only import from API routes
import path from 'path'
import fs from 'fs/promises'
import matter from 'gray-matter'
import { Asset, AssetType, VaultIndexAsset } from '@/types'
import {
  getVaultRoot,
  safeJoinVaultPath,
  sanitizeFileName,
  getAssetFolder,
  getAssetExtension,
  toVaultRelative,
} from './vaultPaths'
import { readVaultIndex } from './vaultIndex'

// ── Path resolution ─────────────────────────────────────────────────────────

/**
 * Returns a unique vault-relative path for an asset, adding a numeric suffix
 * if a file already exists under a different ID.
 */
export async function resolveAssetPath(asset: Asset): Promise<string> {
  const folder = getAssetFolder(asset.type as AssetType)
  const ext = getAssetExtension(asset.type as AssetType)
  const base = sanitizeFileName(asset.title)

  let candidate = `${folder}/${base}${ext}`
  let counter = 2

  while (true) {
    const full = path.join(getVaultRoot(), candidate)
    try {
      await fs.access(full)
      // File exists — check if it belongs to this asset
      const raw = await fs.readFile(full, 'utf-8')
      const existingId = parseFileId(raw, ext)
      if (existingId === asset.id) return candidate
      // Different asset — try next suffix
      candidate = `${folder}/${base}-${counter}${ext}`
      counter++
    } catch {
      return candidate // Path is free
    }
  }
}

function parseFileId(raw: string, ext: string): string | undefined {
  if (ext === '.json') {
    try { return (JSON.parse(raw) as { id?: string }).id } catch { return undefined }
  }
  try { return (matter(raw).data as { id?: string }).id } catch { return undefined }
}

// ── Serialization ────────────────────────────────────────────────────────────

/** Serialize an Asset to a vault file string (.md or .json). */
export function assetToFileContent(asset: Asset): string {
  const ext = getAssetExtension(asset.type as AssetType)

  if (ext === '.json') {
    return JSON.stringify(asset, null, 2)
  }

  // Build YAML frontmatter
  const fm: Record<string, unknown> = {
    id: asset.id,
    type: asset.type,
    title: asset.title,
    description: asset.description ?? '',
    tags: asset.tags ?? [],
    tools: asset.tools ?? [],
    favorite: asset.isFavorite ?? false,
    version: asset.version ?? '1.0.0',
    visibility: asset.visibility ?? 'private',
    status: asset.status ?? 'active',
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    usageCount: asset.usageCount ?? 0,
    copyCount: asset.copyCount ?? 0,
  }
  if (asset.trashedAt) fm.trashedAt = asset.trashedAt
  if (asset.language) fm.language = asset.language

  // Image attachment metadata in frontmatter
  if (asset.type === 'image') {
    if (asset.imagePath)     fm.imagePath     = asset.imagePath
    if (asset.imageFileName) fm.imageFileName = asset.imageFileName
    if (asset.imageMimeType) fm.imageMimeType = asset.imageMimeType
    if (asset.imageSize != null) fm.imageSize = asset.imageSize
    if (asset.imageUploadedAt) fm.imageUploadedAt = asset.imageUploadedAt
  }

  // Build markdown body
  let body = `# ${asset.title}\n\n`

  if (asset.type === 'agent') {
    if (asset.systemPrompt) body += `## System Prompt\n\n${asset.systemPrompt}\n\n`
    if (asset.instructions) body += `## Instructions\n\n${asset.instructions}\n\n`
    if (asset.variables && asset.variables.length > 0) {
      body += `## Variables\n\n`
      asset.variables.forEach((v) => { body += `- ${v.name}: ${v.value}\n` })
      body += '\n'
    }
    if (asset.exampleOutput) body += `## Example Output\n\n${asset.exampleOutput}\n\n`
  } else if (asset.type === 'prompt') {
    if (asset.content) body += `## Prompt\n\n${asset.content}\n\n`
    if (asset.negativePrompt) body += `## Negative Prompt\n\n${asset.negativePrompt}\n\n`
    if (asset.settings && Object.keys(asset.settings).length > 0) {
      body += `## Settings\n\n`
      Object.entries(asset.settings).forEach(([k, v]) => { body += `- ${k}: ${v}\n` })
      body += '\n'
    }
  } else if (asset.type === 'image') {
    if (asset.content) body += `## Generation Prompt\n\n${asset.content}\n\n`
    if (asset.negativePrompt) body += `## Negative Prompt\n\n${asset.negativePrompt}\n\n`
  } else {
    if (asset.content) body += `${asset.content}\n\n`
  }

  if (asset.notes) body += `## Notes\n\n${asset.notes}\n\n`

  return matter.stringify(body.trimEnd() + '\n', fm)
}

/** Parse a vault file back to a partial Asset. */
export function fileContentToAsset(raw: string, ext: string): Partial<Asset> {
  if (ext === '.json') {
    return JSON.parse(raw) as Partial<Asset>
  }

  const parsed = matter(raw)
  const d = parsed.data as Record<string, unknown>
  const toStr = (v: unknown): string => {
    if (v instanceof Date) return v.toISOString()
    return typeof v === 'string' ? v : new Date().toISOString()
  }

  const asset: Partial<Asset> = {
    id: d.id as string,
    type: d.type as AssetType,
    title: d.title as string,
    description: (d.description as string) ?? '',
    tags: (d.tags as string[]) ?? [],
    tools: (d.tools as string[]) ?? [],
    isFavorite: (d.favorite as boolean) ?? false,
    version: (d.version as string) ?? '1.0.0',
    visibility: (d.visibility as 'private' | 'public' | 'team') ?? 'private',
    status: (d.status as Asset['status']) ?? 'active',
    createdAt: toStr(d.createdAt),
    updatedAt: toStr(d.updatedAt),
    usageCount: (d.usageCount as number) ?? 0,
    copyCount: (d.copyCount as number) ?? 0,
    language: d.language as string | undefined,
    trashedAt: d.trashedAt ? toStr(d.trashedAt) : undefined,
  }

  const sections = parseSections(parsed.content)

  if (asset.type === 'agent') {
    if (sections['system_prompt']) asset.systemPrompt = sections['system_prompt']
    if (sections['instructions']) asset.instructions = sections['instructions']
    if (sections['example_output']) asset.exampleOutput = sections['example_output']
  } else if (asset.type === 'prompt') {
    if (sections['prompt']) asset.content = sections['prompt']
    if (sections['negative_prompt']) asset.negativePrompt = sections['negative_prompt']
  } else if (asset.type === 'image') {
    // Support both new format (## Generation Prompt) and old format (raw body)
    if (sections['generation_prompt']) asset.content = sections['generation_prompt']
    else if (sections['_body']) asset.content = sections['_body']
    if (sections['negative_prompt']) asset.negativePrompt = sections['negative_prompt']
    // Image attachment metadata from frontmatter
    if (d.imagePath)     asset.imagePath     = d.imagePath     as string
    if (d.imageFileName) asset.imageFileName = d.imageFileName as string
    if (d.imageMimeType) asset.imageMimeType = d.imageMimeType as string
    if (d.imageSize != null) asset.imageSize = d.imageSize as number
    if (d.imageUploadedAt) asset.imageUploadedAt = toStr(d.imageUploadedAt)
  } else {
    if (sections['_body']) asset.content = sections['_body']
  }

  if (sections['notes']) asset.notes = sections['notes']

  return asset
}

/** Split markdown body into named sections. */
function parseSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = content.split(/\n(?=## )/)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    if (i === 0) {
      // Strip leading # Title line and capture remaining as body
      const body = part.replace(/^# .+\n/, '').trim()
      if (body) sections['_body'] = body
    } else if (part.startsWith('## ')) {
      const nl = part.indexOf('\n')
      if (nl > 0) {
        const key = part.slice(3, nl).trim().toLowerCase().replace(/\s+/g, '_')
        sections[key] = part.slice(nl + 1).trim()
      }
    }
  }
  return sections
}

// ── File I/O ─────────────────────────────────────────────────────────────────

export async function writeAssetFile(asset: Asset, relativePath: string): Promise<void> {
  const full = safeJoinVaultPath(relativePath)
  await fs.mkdir(path.dirname(full), { recursive: true })
  await fs.writeFile(full, assetToFileContent(asset), 'utf-8')
}

export async function readAssetFile(relativePath: string): Promise<Partial<Asset>> {
  const full = safeJoinVaultPath(relativePath)
  const raw = await fs.readFile(full, 'utf-8')
  const ext = path.extname(relativePath)
  return fileContentToAsset(raw, ext)
}

/** Create a timestamped backup before overwriting a file. */
export async function createBackup(relativePath: string): Promise<void> {
  const full = safeJoinVaultPath(relativePath)
  try {
    await fs.access(full)
  } catch {
    return // nothing to back up
  }
  const today = new Date().toISOString().slice(0, 10)
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const name = path.basename(full, path.extname(full))
  const ext = path.extname(full)
  const backupDir = path.join(getVaultRoot(), 'backups', today)
  await fs.mkdir(backupDir, { recursive: true })
  await fs.copyFile(full, path.join(backupDir, `${name}-${ts}${ext}`))
}

/** Move a file into vault/.deleted instead of hard-deleting it. */
export async function moveAssetToDeleted(relativePath: string): Promise<void> {
  const full = safeJoinVaultPath(relativePath)
  try {
    await fs.access(full)
  } catch {
    return // already gone
  }
  const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const name = path.basename(full, path.extname(full))
  const ext = path.extname(full)
  const subDir = path.dirname(relativePath)
  const deletedDir = path.join(getVaultRoot(), '.deleted', subDir)
  await fs.mkdir(deletedDir, { recursive: true })
  await fs.rename(full, path.join(deletedDir, `${name}-${ts}${ext}`))
}

// ── Index rebuild ─────────────────────────────────────────────────────────────

/** Scan vault folders and return a fresh array of index entries. */
export async function scanVaultForAssets(): Promise<VaultIndexAsset[]> {
  const foldersToScan = ['agents', 'prompts', 'markdown', 'code', 'workflows', 'templates', 'images']
  const results: VaultIndexAsset[] = []

  for (const folder of foldersToScan) {
    const dir = path.join(getVaultRoot(), folder)
    const files = await walkDir(dir)
    for (const filePath of files) {
      try {
        const raw = await fs.readFile(filePath, 'utf-8')
        const ext = path.extname(filePath)
        const parsed = fileContentToAsset(raw, ext)
        if (parsed.id && parsed.type && parsed.title) {
          const rel = toVaultRelative(filePath)
          results.push({
            id: parsed.id,
            type: parsed.type as AssetType,
            title: parsed.title,
            description: parsed.description ?? '',
            path: rel,
            tags: parsed.tags ?? [],
            tools: parsed.tools ?? [],
            favorite: parsed.isFavorite ?? false,
            version: parsed.version ?? '1.0.0',
            visibility: parsed.visibility ?? 'private',
            status: parsed.status ?? 'active',
            createdAt: parsed.createdAt ?? new Date().toISOString(),
            updatedAt: parsed.updatedAt ?? new Date().toISOString(),
            trashedAt: parsed.trashedAt ?? null,
            usageCount: parsed.usageCount ?? 0,
            copyCount: parsed.copyCount ?? 0,
            language: parsed.language,
          })
        }
      } catch {
        // skip unparseable files
      }
    }
  }

  return results
}

async function walkDir(dir: string): Promise<string[]> {
  const results: string[] = []
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        results.push(...(await walkDir(full)))
      } else if (e.name.endsWith('.md') || e.name.endsWith('.json')) {
        results.push(full)
      }
    }
  } catch {
    // folder doesn't exist yet
  }
  return results
}
