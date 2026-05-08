'use client'
import { ChevronDown } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { cn } from '@/lib/utils'
import { AssetType, SortOption } from '@/types'

const TYPE_VALUES: (AssetType | 'all')[] = [
  'all', 'agent', 'prompt', 'image', 'markdown', 'code', 'workflow', 'template',
]

const SORT_VALUES: SortOption[] = [
  'lastUsed', 'newest', 'updated', 'mostCopied', 'mostUsed', 'alphabetical',
]

const TYPE_BADGE_COLORS: Partial<Record<AssetType, string>> = {
  agent:    'text-violet-300 bg-violet-500/15 border-violet-500/25',
  prompt:   'text-blue-300 bg-blue-500/15 border-blue-500/25',
  image:    'text-green-300 bg-green-500/15 border-green-500/25',
  markdown: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/25',
  code:     'text-orange-300 bg-orange-500/15 border-orange-500/25',
  workflow: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/25',
  template: 'text-indigo-300 bg-indigo-500/15 border-indigo-500/25',
}

export function FilterBar() {
  const { activeTypeFilter, setTypeFilter, activeSortBy, setSortBy } = useAppStore()
  const { t } = useI18n()

  const typeLabel = (v: AssetType | 'all') =>
    v === 'all' ? t('filter.allTypes') : t(`typeLabel.${v}`)

  const sortLabel = (v: SortOption) => {
    const map: Record<SortOption, string> = {
      lastUsed:     t('filter.sortLastUsed'),
      newest:       t('filter.sortNewest'),
      updated:      t('filter.sortUpdated'),
      mostCopied:   t('filter.sortMostCopied'),
      mostUsed:     t('filter.sortMostUsed'),
      alphabetical: t('filter.sortAlphabetical'),
    }
    return map[v]
  }

  return (
    <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-surface flex-shrink-0 flex-wrap">
      {/* Type filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TYPE_VALUES.map((value) => {
          const isActive = activeTypeFilter === value
          const colorClass =
            value !== 'all' && isActive
              ? (TYPE_BADGE_COLORS[value as AssetType] ?? 'text-accent-blue bg-accent-blue/15 border-accent-blue/25')
              : ''
          return (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                isActive && value === 'all'
                  ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/25'
                  : isActive
                  ? `border ${colorClass}`
                  : 'text-text-muted border-transparent hover:text-text-main hover:bg-surface-hover'
              )}
            >
              {typeLabel(value)}
            </button>
          )
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sort */}
      <div className="relative">
        <select
          value={activeSortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className={cn(
            'appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs',
            'bg-surface-soft border border-border text-text-muted',
            'hover:border-border-soft hover:text-text-main',
            'focus:outline-none focus:border-accent-blue/50',
            'transition-all cursor-pointer'
          )}
        >
          {SORT_VALUES.map((v) => (
            <option key={v} value={v} className="bg-surface">
              {sortLabel(v)}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
        />
      </div>
    </div>
  )
}
