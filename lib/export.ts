import { Asset } from '@/types'
import { formatDate } from '@/lib/utils'

// ── Download helper ───────────────────────────────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Filename helpers ──────────────────────────────────────────────────────────

function safeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── Single asset → Markdown ──────────────────────────────────────────────────

export function assetToMarkdown(asset: Asset): string {
  const lines: string[] = []

  lines.push(`# ${asset.title}`)
  lines.push('')
  lines.push(`> **Type:** ${asset.type} | **Version:** ${asset.version} | **Status:** ${asset.status}`)
  lines.push('')

  if (asset.description) {
    lines.push(asset.description)
    lines.push('')
  }

  // Tags & tools
  if (asset.tags.length) {
    lines.push(`**Tags:** ${asset.tags.map((t) => `\`${t}\``).join(', ')}`)
  }
  if (asset.tools.length) {
    lines.push(`**Tools:** ${asset.tools.join(', ')}`)
  }
  if (asset.tags.length || asset.tools.length) lines.push('')

  // Main content by type
  if (asset.type === 'agent') {
    if (asset.systemPrompt) {
      lines.push('## System Prompt')
      lines.push('')
      lines.push('```')
      lines.push(asset.systemPrompt)
      lines.push('```')
      lines.push('')
    }
    if (asset.instructions) {
      lines.push('## Instructions')
      lines.push('')
      lines.push(asset.instructions)
      lines.push('')
    }
  } else if (asset.type === 'code') {
    lines.push(`## Code (${asset.language ?? 'unknown'})`)
    lines.push('')
    lines.push(`\`\`\`${asset.language ?? ''}`)
    lines.push(asset.content)
    lines.push('```')
    lines.push('')
  } else if (asset.type === 'markdown') {
    lines.push('## Content')
    lines.push('')
    lines.push(asset.content)
    lines.push('')
  } else if (asset.content) {
    lines.push('## Content')
    lines.push('')
    lines.push(asset.content)
    lines.push('')
  }

  if (asset.negativePrompt) {
    lines.push('## Negative Prompt')
    lines.push('')
    lines.push(asset.negativePrompt)
    lines.push('')
  }

  if (asset.settings && Object.keys(asset.settings).length) {
    lines.push('## Settings')
    lines.push('')
    for (const [k, v] of Object.entries(asset.settings)) {
      lines.push(`- **${k}:** ${v}`)
    }
    lines.push('')
  }

  if (asset.variables?.length) {
    lines.push('## Variables')
    lines.push('')
    for (const v of asset.variables) {
      lines.push(`- \`${v.name}\` = \`${v.value}\`${v.description ? ` — ${v.description}` : ''}`)
    }
    lines.push('')
  }

  if (asset.linkedFiles?.length) {
    lines.push('## Linked Files')
    lines.push('')
    for (const f of asset.linkedFiles) {
      lines.push(`- ${f.name}${f.size ? ` (${f.size})` : ''}`)
    }
    lines.push('')
  }

  if (asset.notes) {
    lines.push('## Notes')
    lines.push('')
    lines.push(asset.notes)
    lines.push('')
  }

  if (asset.exampleOutput) {
    lines.push('## Example Output')
    lines.push('')
    lines.push(asset.exampleOutput)
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## Metadata')
  lines.push('')
  lines.push(`| Field | Value |`)
  lines.push(`|-------|-------|`)
  lines.push(`| Created | ${formatDate(asset.createdAt)} |`)
  lines.push(`| Updated | ${formatDate(asset.updatedAt)} |`)
  if (asset.lastUsedAt) lines.push(`| Last Used | ${formatDate(asset.lastUsedAt)} |`)
  lines.push(`| Usage Count | ${asset.usageCount} |`)
  lines.push(`| Copy Count | ${asset.copyCount} |`)
  lines.push(`| Visibility | ${asset.visibility} |`)
  lines.push('')

  return lines.join('\n')
}

// ── Multiple assets → single Markdown ────────────────────────────────────────

export function assetsToMarkdown(assets: Asset[]): string {
  const active = assets.filter((a) => a.status !== 'trash')
  const header = [
    `# PromptVault Export`,
    '',
    `**Exported:** ${new Date().toLocaleString()}`,
    `**Total assets:** ${active.length}`,
    '',
    '---',
    '',
  ].join('\n')

  const body = active.map(assetToMarkdown).join('\n\n---\n\n')
  return header + body
}

// ── Multiple assets → JSON ────────────────────────────────────────────────────

export function assetsToJSON(assets: Asset[]): string {
  const active = assets.filter((a) => a.status !== 'trash')
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    totalAssets: active.length,
    assets: active,
  }
  return JSON.stringify(payload, null, 2)
}

// ── Download wrappers ─────────────────────────────────────────────────────────

export function downloadAssetMarkdown(asset: Asset): void {
  downloadFile(assetToMarkdown(asset), `${safeFilename(asset.title)}.md`, 'text/markdown')
}

export function downloadAllMarkdown(assets: Asset[]): void {
  downloadFile(assetsToMarkdown(assets), `promptvault-export-${todayStamp()}.md`, 'text/markdown')
}

export function downloadAllJSON(assets: Asset[]): void {
  downloadFile(assetsToJSON(assets), `promptvault-export-${todayStamp()}.json`, 'application/json')
}

// ── Import JSON ───────────────────────────────────────────────────────────────

export interface ImportResult {
  assets: Asset[]
  errors: string[]
}

export function parseImportJSON(raw: string): ImportResult {
  const errors: string[] = []
  try {
    const parsed = JSON.parse(raw)
    // Accept either a PromptVault export envelope or a bare array
    const arr: unknown[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.assets)
      ? parsed.assets
      : []

    const assets: Asset[] = []
    for (const item of arr) {
      const a = item as Partial<Asset>
      if (!a.id || !a.title || !a.type) {
        errors.push(`Skipped item without id/title/type`)
        continue
      }
      assets.push({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description ?? '',
        content: a.content ?? '',
        systemPrompt: a.systemPrompt,
        instructions: a.instructions,
        negativePrompt: a.negativePrompt,
        settings: a.settings,
        tags: a.tags ?? [],
        tools: a.tools ?? [],
        linkedFiles: a.linkedFiles,
        notes: a.notes,
        variables: a.variables,
        exampleOutput: a.exampleOutput,
        isFavorite: a.isFavorite ?? false,
        status: a.status ?? 'active',
        visibility: a.visibility ?? 'private',
        version: a.version ?? '1.0.0',
        usageCount: a.usageCount ?? 0,
        copyCount: a.copyCount ?? 0,
        createdAt: a.createdAt ?? new Date().toISOString(),
        updatedAt: a.updatedAt ?? new Date().toISOString(),
        lastUsedAt: a.lastUsedAt,
        language: a.language,
        imageUrl: a.imageUrl,
        imageColor: a.imageColor,
      })
    }
    return { assets, errors }
  } catch (e) {
    return { assets: [], errors: [`Invalid JSON: ${(e as Error).message}`] }
  }
}
