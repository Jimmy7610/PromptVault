'use client'
import { Asset } from '@/types'
import { CopyButton } from '@/components/ui/CopyButton'
import { AssetBadge } from '@/components/assets/AssetBadge'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface GenericDetailProps {
  asset: Asset
}

export function GenericDetail({ asset }: GenericDetailProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <AssetBadge type={asset.type} />
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-soft text-text-dim border border-border">
            v{asset.version}
          </span>
        </div>
        <h2 className="text-base font-bold text-text-main mb-1">{asset.title}</h2>
        <p className="text-xs text-text-muted leading-relaxed">{asset.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Content */}
        {asset.content && (
          <div className="px-4 pt-4">
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              Content
            </div>
            <div className="text-xs text-text-muted bg-background rounded-lg p-3 border border-border font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {asset.content}
            </div>
          </div>
        )}

        {/* Tools */}
        {asset.tools.length > 0 && (
          <div className="px-4 pt-4">
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              Tools
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

        {/* Tags */}
        {asset.tags.length > 0 && (
          <div className="px-4 pt-4">
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              Tags
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

        {/* Notes */}
        {asset.notes && (
          <div className="px-4 pt-4">
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              Notes
            </div>
            <div className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
              {asset.notes}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="px-4 py-4">
          <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
            Metadata
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-dim">Created</span>
              <span className="text-text-muted">{formatDate(asset.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Updated</span>
              <span className="text-text-muted">{formatRelativeTime(asset.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Usage</span>
              <span className="text-text-muted">{asset.usageCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Copies</span>
              <span className="text-text-muted">{asset.copyCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {asset.content && (
        <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-surface">
          <div className="flex flex-wrap gap-2">
            <CopyButton text={asset.content} label="Copy Content" assetId={asset.id} />
          </div>
        </div>
      )}
    </div>
  )
}
