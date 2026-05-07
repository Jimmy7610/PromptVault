// Server-only — only import from API routes, never from client components
import path from 'path'
import fs from 'fs/promises'
import { AssetType } from '@/types'

const VAULT_ROOT = path.resolve(/*turbopackIgnore: true*/ process.cwd(), 'vault')

export function getVaultRoot(): string {
  return VAULT_ROOT
}

export const VAULT_SUBDIRS = [
  'agents',
  'prompts/image',
  'prompts/video',
  'prompts/text',
  'prompts/code',
  'prompts/music',
  'prompts/general',
  'markdown',
  'code',
  'workflows',
  'templates',
  'collections',
  'images',
  'exports',
  'backups',
  '.deleted',
]

export async function ensureVaultStructure(): Promise<void> {
  await fs.mkdir(VAULT_ROOT, { recursive: true })
  for (const sub of VAULT_SUBDIRS) {
    await fs.mkdir(path.join(VAULT_ROOT, sub), { recursive: true })
  }
  const indexPath = path.join(VAULT_ROOT, 'index.json')
  try {
    await fs.access(indexPath)
  } catch {
    const empty = { version: '1.0.0', updatedAt: new Date().toISOString(), assets: [] }
    const tmp = indexPath + '.tmp'
    await fs.writeFile(tmp, JSON.stringify(empty, null, 2), 'utf-8')
    await fs.rename(tmp, indexPath)
  }
}

/** Resolves a vault-relative path and throws if it escapes the vault root. */
export function safeJoinVaultPath(relativePath: string): string {
  // Reject absolute paths immediately
  if (path.isAbsolute(relativePath)) {
    throw new Error(`Absolute paths are not allowed: ${relativePath}`)
  }
  const resolved = path.resolve(VAULT_ROOT, relativePath)
  const vaultWithSep = VAULT_ROOT.endsWith(path.sep) ? VAULT_ROOT : VAULT_ROOT + path.sep
  if (resolved !== VAULT_ROOT && !resolved.startsWith(vaultWithSep)) {
    throw new Error(`Path traversal detected: ${relativePath}`)
  }
  return resolved
}

/** Converts a title to a safe lowercase slug. */
export function sanitizeFileName(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled'
}

export function getAssetFolder(type: AssetType, category?: string): string {
  switch (type) {
    case 'agent':    return 'agents'
    case 'prompt':   return category ? `prompts/${category}` : 'prompts/general'
    case 'markdown': return 'markdown'
    case 'code':     return 'code'
    case 'workflow': return 'workflows'
    case 'template': return 'templates'
    case 'note':     return 'markdown'
    case 'image':    return 'images'
    default:         return 'markdown'
  }
}

export function getAssetExtension(type: AssetType): string {
  return type === 'workflow' || type === 'json' ? '.json' : '.md'
}

/** Normalizes backslashes to forward slashes for cross-platform storage in index.json. */
export function toVaultRelative(absolutePath: string): string {
  return path.relative(VAULT_ROOT, absolutePath).replace(/\\/g, '/')
}
