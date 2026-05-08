'use client'
import { useState } from 'react'
import { X, Pencil, History, FolderOpen, Check } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useCollectionStore } from '@/stores/useCollectionStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { AgentDetail } from './AgentDetail'
import { PromptDetail } from './PromptDetail'
import { MarkdownDetail } from './MarkdownDetail'
import { ImageDetail } from './ImageDetail'
import { CodeDetail } from './CodeDetail'
import { GenericDetail } from './GenericDetail'
import { EditAssetModal } from '@/components/forms/EditAssetModal'
import { VersionHistoryModal } from './VersionHistoryModal'
import { cn } from '@/lib/utils'

export function AssetDetailPanel() {
  const { selectedAssetId, assets, setSelectedAsset } = useAppStore()
  const { collections, setAssetCollections } = useCollectionStore()
  const { t } = useI18n()
  const asset = assets.find((a) => a.id === selectedAssetId)
  const [editOpen, setEditOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  if (!asset) return null

  return (
    <aside className="w-80 xl:w-96 flex-shrink-0 flex flex-col bg-surface border-l border-border h-screen overflow-hidden relative">
      {/* Edit + History + Close buttons */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <button
          onClick={() => setHistoryOpen(true)}
          aria-label={t('inspector.history')}
          title={t('inspector.history')}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
        >
          <History size={13} />
        </button>
        <button
          onClick={() => setEditOpen(true)}
          aria-label={t('inspector.editAsset')}
          title={t('inspector.editAsset')}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => setSelectedAsset(null)}
          aria-label={t('inspector.closePanel')}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
        >
          <X size={14} />
        </button>
      </div>

      {editOpen && (
        <EditAssetModal asset={asset} onClose={() => setEditOpen(false)} />
      )}
      {historyOpen && (
        <VersionHistoryModal asset={asset} onClose={() => setHistoryOpen(false)} />
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

      {/* Collections footer */}
      {collections.length > 0 && (
        <div className="border-t border-border px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-2">
            <FolderOpen size={11} className="text-text-dim" />
            <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
              {t('collections.inCollections')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {collections.map((col) => {
              const isMember = col.assetIds.includes(asset.id)
              return (
                <button
                  key={col.id}
                  onClick={() => {
                    const current = collections
                      .filter((c) => c.assetIds.includes(asset.id))
                      .map((c) => c.id)
                    const next = isMember
                      ? current.filter((id) => id !== col.id)
                      : [...current, col.id]
                    setAssetCollections(asset.id, next)
                  }}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] border transition-all',
                    isMember
                      ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'
                      : 'bg-surface-soft border-border text-text-dim hover:text-text-muted hover:border-border-soft'
                  )}
                >
                  {isMember && <Check size={9} />}
                  {col.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}
