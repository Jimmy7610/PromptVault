'use client'
import { useState } from 'react'
import {
  Plus,
  FolderOpen,
  Pencil,
  Trash2,
  ChevronRight,
} from 'lucide-react'
import { useCollectionStore } from '@/stores/useCollectionStore'
import { useAppStore } from '@/stores/useAppStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { Collection } from '@/types'
import { cn, formatRelativeTime } from '@/lib/utils'
import { CollectionModal } from '@/components/forms/CollectionModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { AssetCard } from '@/components/assets/AssetCard'

// Map colour IDs to Tailwind classes
const COLOR_MAP: Record<string, { dot: string; bg: string; text: string }> = {
  blue:   { dot: 'bg-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-400' },
  violet: { dot: 'bg-violet-500',  bg: 'bg-violet-500/10',  text: 'text-violet-400' },
  green:  { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  amber:  { dot: 'bg-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-400' },
  red:    { dot: 'bg-red-500',     bg: 'bg-red-500/10',     text: 'text-red-400' },
  pink:   { dot: 'bg-pink-500',    bg: 'bg-pink-500/10',    text: 'text-pink-400' },
  cyan:   { dot: 'bg-cyan-500',    bg: 'bg-cyan-500/10',    text: 'text-cyan-400' },
  slate:  { dot: 'bg-slate-500',   bg: 'bg-slate-500/10',   text: 'text-slate-400' },
}

function getColor(id: string) {
  return COLOR_MAP[id] ?? COLOR_MAP.blue
}

export function CollectionsView() {
  const { collections, selectedCollectionId, setSelectedCollection, deleteCollection } = useCollectionStore()
  const { assets, setSelectedAsset, selectedAssetId } = useAppStore()
  const { t } = useI18n()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget]   = useState<Collection | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Collection | undefined>()

  // ── Detail view (single collection) ──────────────────────────────────────────
  if (selectedCollectionId) {
    const col = collections.find((c) => c.id === selectedCollectionId)
    if (!col) {
      setSelectedCollection(null)
      return null
    }
    const colAssets = assets.filter(
      (a) => a.status !== 'trash' && col.assetIds.includes(a.id)
    )
    const colr = getColor(col.color)

    return (
      <div>
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCollection(null)}
              className="text-xs text-text-muted hover:text-text-main transition-colors"
            >
              {t('collections.backToAll')}
            </button>
            <span className="text-text-dim">/</span>
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full flex-shrink-0', colr.dot)} />
              <h2 className="text-sm font-semibold text-text-main">{col.name}</h2>
              <span className="px-1.5 py-0.5 rounded-md bg-surface-soft text-text-dim text-[10px] font-medium border border-border">
                {colAssets.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditTarget(col)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
              aria-label="Edit collection"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setDeleteTarget(col)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-danger hover:bg-danger/10 transition-all"
              aria-label="Delete collection"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {col.description && (
          <p className="text-xs text-text-muted mb-4">{col.description}</p>
        )}

        {colAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen size={36} className="text-text-dim mb-3" />
            <div className="text-sm text-text-muted mb-1">{t('collections.noAssetsInCol')}</div>
            <div className="text-xs text-text-dim">{t('collections.addAssets')}</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {colAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}

        {/* Edit modal */}
        <CollectionModal
          collection={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(undefined)}
        />

        {/* Delete confirm */}
        <ConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(undefined)}
          onConfirm={() => {
            if (deleteTarget) {
              deleteCollection(deleteTarget.id)
              setSelectedCollection(null)
            }
          }}
          title={t('collections.deleteConfirm')}
          message={`"${deleteTarget?.name}" ${t('collections.deleteMessage')}`}
          confirmLabel={t('collections.deleteForever')}
          requireWord="DELETE"
        />
      </div>
    )
  }

  // ── All collections grid ──────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-text-main">{t('collections.title')}</h2>
          <span className="px-1.5 py-0.5 rounded-md bg-surface-soft text-text-dim text-[10px] font-medium border border-border">
            {collections.length}
          </span>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main border border-border hover:border-border-soft px-2.5 py-1.5 rounded-lg transition-all"
        >
          <Plus size={12} />
          {t('collections.new')}
        </button>
      </div>

      {/* Empty state */}
      {collections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen size={36} className="text-text-dim mb-3" />
          <div className="text-sm text-text-muted mb-1">{t('collections.empty')}</div>
          <div className="text-xs text-text-dim mb-4">{t('collections.emptyDesc')}</div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/20 text-sm transition-all border border-accent-blue/25"
          >
            <Plus size={14} />
            {t('collections.create')}
          </button>
        </div>
      )}

      {/* Collection cards grid */}
      {collections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {collections.map((col) => {
            const colr = getColor(col.color)
            const activeAssets = assets.filter(
              (a) => a.status !== 'trash' && col.assetIds.includes(a.id)
            )
            const countLabel =
              activeAssets.length === 0
                ? t('collections.noAssets')
                : activeAssets.length === 1
                ? t('collections.oneAsset')
                : t('collections.assetCount').replace('{n}', String(activeAssets.length))

            return (
              <div
                key={col.id}
                className="group relative rounded-xl border border-border bg-surface p-4 cursor-pointer hover:border-border-soft hover:bg-surface-hover transition-all select-none"
                onClick={() => setSelectedCollection(col.id)}
              >
                {/* Colour dot + name */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={cn('w-3 h-3 rounded-full flex-shrink-0', colr.dot)} />
                  <h3 className="text-sm font-semibold text-text-main truncate flex-1">{col.name}</h3>
                  {/* Edit / delete hover actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditTarget(col) }}
                      aria-label="Edit"
                      className="w-6 h-6 flex items-center justify-center rounded text-text-dim hover:text-text-muted transition-colors"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(col) }}
                      aria-label="Delete"
                      className="w-6 h-6 flex items-center justify-center rounded text-text-dim hover:text-danger transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {col.description && (
                  <p className="text-xs text-text-muted line-clamp-2 mb-2.5 leading-relaxed">
                    {col.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                  <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded', colr.bg, colr.text)}>
                    {countLabel}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-text-dim">
                    <span>{formatRelativeTime(col.updatedAt)}</span>
                    <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create modal */}
      <CollectionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit modal */}
      <CollectionModal
        collection={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(undefined)}
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        onConfirm={() => {
          if (deleteTarget) deleteCollection(deleteTarget.id)
        }}
        title={t('collections.deleteConfirm')}
        message={`"${deleteTarget?.name}" ${t('collections.deleteMessage')}`}
        confirmLabel={t('collections.deleteForever')}
        requireWord="DELETE"
      />
    </div>
  )
}
