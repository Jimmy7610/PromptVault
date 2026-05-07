'use client'
import { ChevronDown } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import { AssetType, SortOption } from '@/types'

const TYPE_OPTIONS: { value: AssetType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'agent', label: 'Agents' },
  { value: 'prompt', label: 'Prompts' },
  { value: 'image', label: 'Images' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'code', label: 'Code' },
  { value: 'workflow', label: 'Workflows' },
  { value: 'template', label: 'Templates' },
  { value: 'json', label: 'JSON' },
  { value: 'note', label: 'Notes' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lastUsed', label: 'Last Used' },
  { value: 'newest', label: 'Newest' },
  { value: 'updated', label: 'Last Updated' },
  { value: 'mostCopied', label: 'Most Copied' },
  { value: 'mostUsed', label: 'Most Used' },
  { value: 'alphabetical', label: 'A – Z' },
]

const TYPE_BADGE_COLORS: Partial<Record<AssetType, string>> = {
  agent: 'text-violet-300 bg-violet-500/15 border-violet-500/25',
  prompt: 'text-blue-300 bg-blue-500/15 border-blue-500/25',
  image: 'text-green-300 bg-green-500/15 border-green-500/25',
  markdown: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/25',
  code: 'text-orange-300 bg-orange-500/15 border-orange-500/25',
  workflow: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/25',
  template: 'text-indigo-300 bg-indigo-500/15 border-indigo-500/25',
}

export function FilterBar() {
  const { activeTypeFilter, setTypeFilter, activeSortBy, setSortBy } = useAppStore()

  return (
    <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-surface flex-shrink-0 flex-wrap">
      {/* Type filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TYPE_OPTIONS.slice(0, 8).map((opt) => {
          const isActive = activeTypeFilter === opt.value
          const colorClass =
            opt.value !== 'all' && isActive
              ? (TYPE_BADGE_COLORS[opt.value as AssetType] ?? 'text-accent-blue bg-accent-blue/15 border-accent-blue/25')
              : ''
          return (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                isActive && opt.value === 'all'
                  ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/25'
                  : isActive
                  ? `border ${colorClass}`
                  : 'text-text-muted border-transparent hover:text-text-main hover:bg-surface-hover'
              )}
            >
              {opt.label}
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
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface">
              {opt.label}
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
