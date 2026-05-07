'use client'
import { Download, Image as ImageIcon } from 'lucide-react'
import { Asset } from '@/types'
import { CopyButton } from '@/components/ui/CopyButton'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface ImageDetailProps {
  asset: Asset
}

export function ImageDetail({ asset }: ImageDetailProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/15 text-green-300 border border-green-500/25">
            Image
          </span>
        </div>
        <h2 className="text-base font-bold text-text-main mb-1">{asset.title}</h2>
        <p className="text-xs text-text-muted leading-relaxed">{asset.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Image Preview */}
        <div className="px-4 pt-4">
          <div
            className="w-full h-48 rounded-xl border border-border flex items-center justify-center mb-4 overflow-hidden"
            style={{
              background: asset.imageColor
                ? `linear-gradient(135deg, ${asset.imageColor} 0%, #0E1421 100%)`
                : 'linear-gradient(135deg, #1a0a2e 0%, #0E1421 100%)',
            }}
          >
            <div className="text-center">
              <ImageIcon size={32} className="text-white/20 mx-auto mb-2" />
              <div className="text-[10px] text-white/30">Image Preview</div>
            </div>
          </div>
        </div>

        {/* Prompt used */}
        {asset.content && (
          <div className="px-4 mb-4">
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              Generation Prompt
            </div>
            <div className="text-xs text-text-muted bg-background rounded-lg p-3 border border-border leading-relaxed font-mono">
              {asset.content}
            </div>
          </div>
        )}

        {/* Negative Prompt */}
        {asset.negativePrompt && (
          <div className="px-4 mb-4">
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              Negative Prompt
            </div>
            <div className="text-xs text-text-muted bg-background rounded-lg p-3 border border-danger/15 leading-relaxed font-mono">
              {asset.negativePrompt}
            </div>
          </div>
        )}

        {/* Tools + Tags */}
        <div className="px-4 mb-4">
          {asset.tools.length > 0 && (
            <div className="mb-3">
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
          {asset.tags.length > 0 && (
            <div>
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
        </div>

        {/* Metadata */}
        <div className="px-4 pb-4">
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
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-surface">
        <div className="flex flex-wrap gap-2">
          {asset.content && <CopyButton text={asset.content} label="Copy Prompt" assetId={asset.id} />}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-text-muted hover:text-text-main text-xs transition-colors">
            <Download size={11} /> Download
          </button>
        </div>
      </div>
    </div>
  )
}
