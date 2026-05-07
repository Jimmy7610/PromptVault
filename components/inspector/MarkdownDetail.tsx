'use client'
import { useState } from 'react'
import { Eye, Code2, Download } from 'lucide-react'
import { Asset } from '@/types'
import { CopyButton } from '@/components/ui/CopyButton'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { downloadAssetMarkdown } from '@/lib/export'

interface MarkdownDetailProps {
  asset: Asset
}

type ViewMode = 'preview' | 'raw'

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-text-main mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-text-main mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-text-main mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-text-main">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-surface-soft text-accent-blue font-mono text-[11px]">$1</code>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-start gap-2 my-0.5"><span class="w-3.5 h-3.5 mt-0.5 rounded border border-border flex-shrink-0 bg-background"></span><span>$1</span></div>')
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-start gap-2 my-0.5 opacity-60 line-through"><span class="w-3.5 h-3.5 mt-0.5 rounded border border-accent-blue bg-accent-blue/20 flex-shrink-0"></span><span>$1</span></div>')
    .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 my-0.5"><span class="w-1 h-1 rounded-full bg-text-dim mt-2 flex-shrink-0"></span><span>$1</span></div>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.split('|').filter((c) => c.trim() && !c.match(/^[-\s]+$/))
      if (!cells.length) return ''
      return `<div class="flex gap-2 border-b border-border py-1">${cells.map((c) => `<span class="flex-1 text-[11px] text-text-muted">${c.trim()}</span>`).join('')}</div>`
    })
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, '')
}

export function MarkdownDetail({ asset }: MarkdownDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('preview')

  const wordCount = asset.content.split(/\s+/).filter(Boolean).length
  const lineCount = asset.content.split('\n').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/15 text-yellow-300 border border-yellow-500/25">
            Markdown
          </span>
          <span className="text-[10px] text-text-dim">{wordCount} words · {lineCount} lines</span>
        </div>
        <h2 className="text-base font-bold text-text-main mb-1">{asset.title}</h2>
        <p className="text-xs text-text-muted leading-relaxed">{asset.description}</p>

        {/* View toggle */}
        <div className="flex items-center gap-1 mt-3 bg-surface-soft rounded-lg p-0.5 w-fit border border-border">
          <button
            onClick={() => setViewMode('preview')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] transition-all',
              viewMode === 'preview'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-text-dim hover:text-text-muted'
            )}
          >
            <Eye size={11} /> Preview
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] transition-all',
              viewMode === 'raw'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-text-dim hover:text-text-muted'
            )}
          >
            <Code2 size={11} /> Raw
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'preview' ? (
          <div
            className="px-4 py-4 text-xs text-text-muted leading-relaxed prose-sm"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(asset.content) }}
          />
        ) : (
          <div className="px-4 py-4">
            <pre className="text-[11px] text-text-muted font-mono leading-relaxed whitespace-pre-wrap break-words">
              {asset.content}
            </pre>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-surface">
        <div className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-2">
          Quick Actions
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={asset.content} label="Copy Markdown" assetId={asset.id} />
          <button
            onClick={() => downloadAssetMarkdown(asset)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-text-muted hover:text-text-main text-xs transition-colors"
          >
            <Download size={11} /> Export .md
          </button>
        </div>
        <div className="mt-2 text-[10px] text-text-dim">
          Updated {formatRelativeTime(asset.updatedAt)} · Created {formatDate(asset.createdAt)}
        </div>
      </div>
    </div>
  )
}
