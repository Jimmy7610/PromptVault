'use client'
import { useState } from 'react'
import { Plus, SearchX, Layers, Trash2 } from 'lucide-react'
import { AssetCard } from './AssetCard'
import { useAppStore } from '@/stores/useAppStore'
import { useFilteredAssets } from '@/hooks/useFilteredAssets'
import { useI18n } from '@/lib/i18n/useI18n'
import { cn } from '@/lib/utils'
import { SettingsView } from '@/components/settings/SettingsView'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function AssetGrid() {
  const { activeSection, searchQuery, viewMode, openNewAssetModal, emptyTrash } = useAppStore()
  const assets = useFilteredAssets()
  const { t } = useI18n()
  const [emptyTrashConfirmOpen, setEmptyTrashConfirmOpen] = useState(false)

  // Map section to nav translation key (most match nav.* keys)
  const sectionTitleKey: Record<string, string> = {
    dashboard:  'nav.allAssets',
    all:        'nav.allAssets',
    agents:     'nav.agents',
    prompts:    'nav.prompts',
    images:     'nav.images',
    markdown:   'nav.markdownFiles',
    code:       'nav.codeSnippets',
    workflows:  'nav.workflows',
    collections:'nav.collections',
    templates:  'nav.templates',
    recent:     'nav.recent',
    favorites:  'nav.favorites',
    trash:      'nav.trash',
    settings:   'nav.settings',
  }
  const title = t(sectionTitleKey[activeSection] ?? 'nav.allAssets')

  if (activeSection === 'settings') {
    return <SettingsView />
  }

  if (activeSection === 'collections') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-text-muted text-sm mb-2">{t('grid.collectionsComingSoon')}</div>
          <div className="text-text-dim text-xs">{t('grid.collectionsDesc')}</div>
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
              {t('grid.matching')} &ldquo;{searchQuery}&rdquo;
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
            {t('grid.emptyTrash')}
          </button>
        ) : (
          <button
            onClick={() => openNewAssetModal()}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main border border-border hover:border-border-soft px-2.5 py-1.5 rounded-lg transition-all"
          >
            <Plus size={12} />
            {t('grid.new')}
          </button>
        )}
      </div>

      {/* Empty state */}
      {assets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {searchQuery ? (
            <>
              <SearchX size={36} className="text-text-dim mb-3" />
              <div className="text-sm text-text-muted mb-1">{t('grid.noAssetsFound')}</div>
              <div className="text-xs text-text-dim">
                {t('grid.noResults').replace('{q}', searchQuery)}
              </div>
            </>
          ) : (
            <>
              <Layers size={36} className="text-text-dim mb-3" />
              <div className="text-sm text-text-muted mb-1">{t('grid.noAssetsYet')}</div>
              <div className="text-xs text-text-dim mb-4">
                {t('grid.createFirst')}
              </div>
              <button
                onClick={() => openNewAssetModal()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/20 text-sm transition-all border border-accent-blue/25"
              >
                <Plus size={14} />
                {t('grid.newAsset')}
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
      title={t('grid.emptyTrashConfirm')}
      message={t('grid.emptyTrashMessage').replace('{n}', String(assets.length))}
      confirmLabel={t('grid.emptyTrash')}
      requireWord="DELETE"
    />
    </>
  )
}
