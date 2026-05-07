'use client'
import { useState } from 'react'
import { X, Pencil } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { AgentDetail } from './AgentDetail'
import { PromptDetail } from './PromptDetail'
import { MarkdownDetail } from './MarkdownDetail'
import { ImageDetail } from './ImageDetail'
import { CodeDetail } from './CodeDetail'
import { GenericDetail } from './GenericDetail'
import { EditAssetModal } from '@/components/forms/EditAssetModal'

export function AssetDetailPanel() {
  const { selectedAssetId, assets, setSelectedAsset } = useAppStore()
  const asset = assets.find((a) => a.id === selectedAssetId)
  const [editOpen, setEditOpen] = useState(false)

  if (!asset) return null

  return (
    <aside className="w-80 xl:w-96 flex-shrink-0 flex flex-col bg-surface border-l border-border h-screen overflow-hidden relative">
      {/* Edit + Close buttons */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <button
          onClick={() => setEditOpen(true)}
          aria-label="Edit asset"
          className="w-6 h-6 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => setSelectedAsset(null)}
          aria-label="Close detail panel"
          className="w-6 h-6 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
        >
          <X size={14} />
        </button>
      </div>

      {editOpen && (
        <EditAssetModal asset={asset} onClose={() => setEditOpen(false)} />
      )}

      {/* Detail component */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {asset.type === 'agent' && <AgentDetail asset={asset} />}
        {asset.type === 'prompt' && <PromptDetail asset={asset} />}
        {asset.type === 'markdown' && <MarkdownDetail asset={asset} />}
        {asset.type === 'image' && <ImageDetail asset={asset} />}
        {asset.type === 'code' && <CodeDetail asset={asset} />}
        {!['agent', 'prompt', 'markdown', 'image', 'code'].includes(asset.type) && (
          <GenericDetail asset={asset} />
        )}
      </div>
    </aside>
  )
}
