'use client'
import { Asset } from '@/types'
import { CopyButton } from '@/components/ui/CopyButton'
import { AssetStatusRow } from './AssetStatusRow'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/useI18n'

interface CodeDetailProps {
  asset: Asset
}

const LANG_COLORS: Record<string, string> = {
  python: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  javascript: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  typescript: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  html: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  css: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  sql: 'text-green-400 bg-green-500/10 border-green-500/20',
  json: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  bash: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  powershell: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

function highlightCode(code: string, lang?: string): React.ReactNode {
  // Simple syntax highlighting using spans
  // In a real app, use a library like highlight.js or prism
  return (
    <pre className="text-[11px] font-mono leading-relaxed whitespace-pre overflow-x-auto text-text-muted">
      {code}
    </pre>
  )
}

export function CodeDetail({ asset }: CodeDetailProps) {
  const { t } = useI18n()
  const lang = asset.language?.toLowerCase() ?? 'other'
  const langColor = LANG_COLORS[lang] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/20'
  const lineCount = asset.content.split('\n').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/25">
            {t('typeLabel.code')}
          </span>
          {asset.language && (
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] border font-mono', langColor)}>
              {asset.language}
            </span>
          )}
          <span className="text-[10px] text-text-dim">{lineCount} {t('codeView.lines')}</span>
        </div>
        <h2 className="text-base font-bold text-text-main mb-1">{asset.title}</h2>
        <p className="text-xs text-text-muted leading-relaxed">{asset.description}</p>
        <AssetStatusRow asset={asset} />
      </div>

      {/* Code block */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <div className="relative">
            <div className="flex items-center justify-between px-3 py-2 bg-surface-soft border-x border-t border-border rounded-t-lg">
              <span className="text-[10px] text-text-dim font-mono">
                {asset.title.includes('.') ? asset.title : `snippet.${lang}`}
              </span>
              <CopyButton
                text={asset.content}
                label={t('codeView.copyCode')}
                assetId={asset.id}
                size="sm"
                variant="icon"
              />
            </div>
            <div className="bg-background border border-border rounded-b-lg overflow-x-auto">
              <div className="flex">
                {/* Line numbers */}
                <div className="flex-shrink-0 px-3 py-3 text-right border-r border-border select-none">
                  {asset.content.split('\n').map((_, i) => (
                    <div key={i} className="text-[10px] text-text-dim font-mono leading-[1.6]">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Code */}
                <div className="px-4 py-3 overflow-x-auto flex-1">
                  {highlightCode(asset.content, asset.language)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools + Tags */}
        <div className="px-4 mb-4">
          {asset.tools.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                {t('inspector.tools')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {asset.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded text-[10px] bg-accent-blue/10 text-blue-400 border border-accent-blue/15"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          {asset.tags.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                {t('inspector.tags')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] bg-surface-soft text-text-dim border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {asset.notes && (
          <div className="px-4 mb-4">
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              {t('inspector.notes')}
            </div>
            <div className="text-xs text-text-muted leading-relaxed">{asset.notes}</div>
          </div>
        )}

        {/* Metadata */}
        <div className="px-4 pb-4">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-dim">{t('inspector.created')}</span>
              <span className="text-text-muted">{formatDate(asset.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">{t('inspector.updated')}</span>
              <span className="text-text-muted">{formatRelativeTime(asset.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">{t('inspector.copies')}</span>
              <span className="text-text-muted">{asset.copyCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-surface">
        <div className="flex flex-wrap gap-2">
          <CopyButton text={asset.content} label={t('codeView.copyCode')} assetId={asset.id} />
        </div>
      </div>
    </div>
  )
}
