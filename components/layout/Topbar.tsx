'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, Bell, Grid3X3, List, Filter, Command } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { cn } from '@/lib/utils'
import { AdvancedFilterPopover } from '@/components/filters/AdvancedFilterPopover'
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover'

export function Topbar() {
  const { searchQuery, setSearchQuery, viewMode, setViewMode, filterFavoriteOnly, filterTags, filterTools, filterVisibility } = useAppStore()
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length)
  const inputRef = useRef<HTMLInputElement>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const activeFilterCount = [
    filterFavoriteOnly,
    filterVisibility !== 'all',
    filterTags.length > 0,
    filterTools.length > 0,
  ].filter(Boolean).length

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <header className="flex items-center gap-3 px-6 py-3 border-b border-border bg-surface flex-shrink-0">
      {/* Search */}
      <div className="flex-1 relative max-w-xl">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assets, agents, prompts, files, notes..."
          className={cn(
            'w-full pl-9 pr-20 py-2 text-sm rounded-lg',
            'bg-surface-soft border border-border',
            'text-text-main placeholder:text-text-dim',
            'focus:outline-none focus:border-accent-blue/50 focus:bg-background',
            'transition-all'
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-text-dim bg-surface border border-border font-mono">
            <Command size={9} />K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* View mode toggle */}
        <div className="flex items-center bg-surface-soft rounded-lg p-0.5 border border-border">
          <button
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={cn(
              'p-1.5 rounded transition-all',
              viewMode === 'grid'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-text-dim hover:text-text-muted'
            )}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={cn(
              'p-1.5 rounded transition-all',
              viewMode === 'list'
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-text-dim hover:text-text-muted'
            )}
          >
            <List size={14} />
          </button>
        </div>

        {/* Filters button */}
        <div className="relative">
          <button
            onClick={() => { setFiltersOpen(!filtersOpen); setNotificationsOpen(false) }}
            aria-label="Filters"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all',
              activeFilterCount > 0
                ? 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                : 'border-border text-text-muted hover:text-text-main hover:border-border-soft bg-surface-soft'
            )}
          >
            <Filter size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-accent-blue text-white text-[10px] flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>
          {filtersOpen && (
            <AdvancedFilterPopover onClose={() => setFiltersOpen(false)} />
          )}
        </div>

        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => { setNotificationsOpen(!notificationsOpen); setFiltersOpen(false) }}
            aria-label="Notifications"
            className={cn(
              'relative w-8 h-8 flex items-center justify-center rounded-lg transition-all',
              notificationsOpen
                ? 'bg-surface-hover text-text-main'
                : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-blue rounded-full" />
            )}
          </button>
          {notificationsOpen && (
            <NotificationsPopover onClose={() => setNotificationsOpen(false)} />
          )}
        </div>
      </div>
    </header>
  )
}
