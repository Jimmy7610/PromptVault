'use client'
import { useState } from 'react'
import { Plus, SearchX, Layers, Trash2 } from 'lucide-react'
import { AssetCard } from './AssetCard'
import { useAppStore } from '@/stores/useAppStore'
import { useFilteredAssets } from '@/hooks/useFilteredAssets'
import { cn } from '@/lib/utils'
import { SettingsView } from '@/components/settings/SettingsView'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'All Assets',
  all: 'All Assets',
  agents: 'Agents',
  prompts: 'Prompts',
  images: 'Images',
  markdown: 'Markdown Files',
  code: 'Code Snippets',
  workflows: 'Workflows',
  collections: 'Collections',
  templates: 'Templates',
  recent: 'Recent',
  favorites: 'Favorites',
  trash: 'Trash',
  settings: 'Settings',
}

export function AssetGrid() {
  const { activeSection, searchQuery, viewMode, openNewAssetModal, emptyTrash } = useAppStore()
  const assets = useFilteredAssets()
  const [emptyTrashConfirmOpen, setEmptyTrashConfirmOpen] = useState(false)

  const title = SECTION_TITLES[activeSection] ?? 'Assets'

  if (activeSection === 'settings') {
    return <SettingsView />
  }

  if (activeSection === 'collections') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-text-muted text-sm mb-2">Collections coming soon</div>
          <div className="text-text-dim text-xs">Group and organize assets into custom collections</div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-text-main">{title}</h2>
          <span className="px-1.5 py-0.5 rounded-md bg-surface-soft text-text-dim text-[10px] font-medium border border-border">
            {assets.length}
          </span>
          {searchQuery && (
            <span className="text-xs text-text-muted">
              matching &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
        {activeSection === 'trash' ? (
          <button
            onClick={() => setEmptyTrashConfirmOpen(true)}
            disabled={assets.length === 0}
            className="flex items-center gap-1.5 text-xs text-danger border border-danger/30 hover:border-danger/60 hover:bg-danger/10 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={12} />
            Empty Trash
          </button>
        ) : (
          <button
            onClick={() => openNewAssetModal()}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main border border-border hover:border-border-soft px-2.5 py-1.5 rounded-lg transition-all"
          >
            <Plus size={12} />
            New
          </button>
        )}
      </div>

      {/* Empty state */}
      {assets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {searchQuery ? (
            <>
              <SearchX size={36} className="text-text-dim mb-3" />
              <div className="text-sm text-text-muted mb-1">No assets found</div>
              <div className="text-xs text-text-dim">
                No results for &ldquo;{searchQuery}&rdquo; — try a different search
              </div>
            </>
          ) : (
            <>
              <Layers size={36} className="text-text-dim mb-3" />
              <div className="text-sm text-text-muted mb-1">No assets yet</div>
              <div className="text-xs text-text-dim mb-4">
                Create your first asset to get started
              </div>
              <button
                onClick={() => openNewAssetModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/20 text-sm transition-all border border-accent-blue/25"
              >
                <Plus size={14} />
                New Asset
              </button>
            </>
          )}
        </div>
      )}

      {/* Grid / List */}
      {assets.length > 0 && (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3'
              : 'flex flex-col gap-2'
          )}
        >
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>

    <ConfirmModal
      open={emptyTrashConfirmOpen}
      onClose={() => setEmptyTrashConfirmOpen(false)}
      onConfirm={emptyTrash}
      title="Empty trash?"
      message={`This will permanently delete all ${assets.length} item${assets.length !== 1 ? 's' : ''} in the trash. This cannot be undone.`}
      confirmLabel="Empty Trash"
      requireWord="DELETE"
    />
    </>
  )
}
