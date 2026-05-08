'use client'
import { useEffect } from 'react'
import { X, Star, Eye, EyeOff, Users, Globe } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { cn } from '@/lib/utils'
import { FilterVisibility } from '@/types'

interface AdvancedFilterPopoverProps {
  onClose: () => void
}

export function AdvancedFilterPopover({ onClose }: AdvancedFilterPopoverProps) {
  const {
    assets,
    filterFavoriteOnly,
    filterTags,
    filterTools,
    filterVisibility,
    setFilterFavoriteOnly,
    setFilterTags,
    setFilterTools,
    setFilterVisibility,
    clearAdvancedFilters,
  } = useAppStore()
  const { t } = useI18n()

  const VISIBILITY_OPTIONS: { value: FilterVisibility; icon: React.ElementType }[] = [
    { value: 'all',     icon: Globe },
    { value: 'private', icon: EyeOff },
    { value: 'public',  icon: Eye },
    { value: 'team',    icon: Users },
  ]

  const visLabel = (v: FilterVisibility) => {
    const map: Record<FilterVisibility, string> = {
      all:     t('filter.visAll'),
      private: t('filter.visPrivate'),
      public:  t('filter.visPublic'),
      team:    t('filter.visTeam'),
    }
    return map[v]
  }

  // Derive available tags and tools from non-trash assets
  const activeAssets = assets.filter((a) => a.status !== 'trash')
  const allTags = Array.from(new Set(activeAssets.flatMap((a) => a.tags))).sort()
  const allTools = Array.from(new Set(activeAssets.flatMap((a) => a.tools))).sort()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const toggleTag = (tag: string) => {
    setFilterTags(
      filterTags.includes(tag) ? filterTags.filter((t) => t !== tag) : [...filterTags, tag]
    )
  }

  const toggleTool = (tool: string) => {
    setFilterTools(
      filterTools.includes(tool) ? filterTools.filter((t) => t !== tool) : [...filterTools, tool]
    )
  }

  const activeCount = [
    filterFavoriteOnly,
    filterVisibility !== 'all',
    filterTags.length > 0,
    filterTools.length > 0,
  ].filter(Boolean).length

  return (
    <>
      {/* Click-outside overlay */}
      <div className="fixed inset-0 z-20" onClick={onClose} />

      <div className="absolute right-0 top-full mt-2 z-30 w-80 rounded-xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-150 origin-top-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-main">{t('filter.advanced')}</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-accent-blue/20 text-accent-blue">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                onClick={clearAdvancedFilters}
                className="text-xs text-accent-blue hover:text-blue-400 transition-colors"
              >
                {t('filter.clearAll')}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-text-dim hover:text-text-muted p-0.5 transition-colors rounded"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Favorites only */}
          <button
            onClick={() => setFilterFavoriteOnly(!filterFavoriteOnly)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-sm',
              filterFavoriteOnly
                ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
                : 'border-border text-text-muted hover:border-border-soft hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <Star
              size={14}
              className={filterFavoriteOnly ? 'fill-yellow-400 text-yellow-400' : 'text-text-dim'}
            />
            {t('filter.favoritesOnly')}
          </button>

          {/* Visibility */}
          <div>
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              {t('filter.visibility')}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {VISIBILITY_OPTIONS.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilterVisibility(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[11px] transition-all',
                      filterVisibility === opt.value
                        ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                        : 'border-border text-text-dim hover:border-border-soft hover:text-text-muted'
                    )}
                  >
                    <Icon size={13} />
                    {visLabel(opt.value)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tools */}
          {allTools.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                {t('filter.tools')}{filterTools.length > 0 && <span className="ml-1 text-accent-blue">({filterTools.length})</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allTools.map((tool) => (
                  <button
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs border transition-all',
                      filterTools.includes(tool)
                        ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                        : 'border-border text-text-muted hover:border-border-soft hover:text-text-main'
                    )}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                {t('filter.tags')}{filterTags.length > 0 && <span className="ml-1 text-accent-blue">({filterTags.length})</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs border transition-all',
                      filterTags.includes(tag)
                        ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                        : 'border-border text-text-muted hover:border-border-soft hover:text-text-main'
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {allTags.length === 0 && allTools.length === 0 && (
            <p className="text-xs text-text-dim text-center py-2">
              {t('filter.noTagsOrTools')}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
