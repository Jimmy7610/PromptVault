'use client'
import { useMemo } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { Asset } from '@/types'

const SECTION_TYPE_MAP: Record<string, string> = {
  agents: 'agent',
  prompts: 'prompt',
  images: 'image',
  markdown: 'markdown',
  code: 'code',
  workflows: 'workflow',
  templates: 'template',
}

export function useFilteredAssets(): Asset[] {
  const {
    assets,
    searchQuery,
    activeSection,
    activeTypeFilter,
    activeSortBy,
    filterFavoriteOnly,
    filterTags,
    filterTools,
    filterVisibility,
  } = useAppStore()

  return useMemo(() => {
    let filtered = [...assets]

    // Trash filter
    if (activeSection === 'trash') {
      return filtered.filter((a) => a.status === 'trash')
    }

    // Exclude trashed items from all other views
    filtered = filtered.filter((a) => a.status !== 'trash')

    // Section-specific filter
    if (activeSection === 'favorites') {
      filtered = filtered.filter((a) => a.isFavorite)
    } else if (SECTION_TYPE_MAP[activeSection]) {
      filtered = filtered.filter((a) => a.type === SECTION_TYPE_MAP[activeSection])
    } else if (activeSection === 'recent') {
      filtered.sort((a, b) => {
        const da = a.lastUsedAt || a.updatedAt
        const db = b.lastUsedAt || b.updatedAt
        return new Date(db).getTime() - new Date(da).getTime()
      })
      return filtered.slice(0, 20)
    }

    // Type filter (only applies when no section-specific filter)
    if (
      activeTypeFilter !== 'all' &&
      !SECTION_TYPE_MAP[activeSection] &&
      activeSection !== 'favorites'
    ) {
      filtered = filtered.filter((a) => a.type === activeTypeFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.tools.some((t) => t.toLowerCase().includes(q)) ||
          (a.content && a.content.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      )
    }

    // ── Advanced filters ──────────────────────────────────────────────────────

    if (filterFavoriteOnly) {
      filtered = filtered.filter((a) => a.isFavorite)
    }

    if (filterVisibility !== 'all') {
      filtered = filtered.filter((a) => a.visibility === filterVisibility)
    }

    if (filterTags.length > 0) {
      // OR logic: asset must have at least one selected tag
      filtered = filtered.filter((a) => filterTags.some((t) => a.tags.includes(t)))
    }

    if (filterTools.length > 0) {
      // OR logic: asset must use at least one selected tool
      filtered = filtered.filter((a) => filterTools.some((t) => a.tools.includes(t)))
    }

    // ── Sort ──────────────────────────────────────────────────────────────────

    switch (activeSortBy) {
      case 'newest':
        filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'mostCopied':
        filtered.sort((a, b) => b.copyCount - a.copyCount)
        break
      case 'mostUsed':
        filtered.sort((a, b) => b.usageCount - a.usageCount)
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'updated':
        filtered.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        break
      case 'lastUsed':
      default:
        filtered.sort((a, b) => {
          const da = a.lastUsedAt || a.updatedAt
          const db = b.lastUsedAt || b.updatedAt
          return new Date(db).getTime() - new Date(da).getTime()
        })
        break
    }

    return filtered
  }, [
    assets,
    searchQuery,
    activeSection,
    activeTypeFilter,
    activeSortBy,
    filterFavoriteOnly,
    filterTags,
    filterTools,
    filterVisibility,
  ])
}

export function useAssetCounts() {
  const assets = useAppStore((s) => s.assets)

  return useMemo(() => {
    const active = assets.filter((a) => a.status !== 'trash')
    return {
      all: active.length,
      agents: active.filter((a) => a.type === 'agent').length,
      prompts: active.filter((a) => a.type === 'prompt').length,
      images: active.filter((a) => a.type === 'image').length,
      markdown: active.filter((a) => a.type === 'markdown').length,
      code: active.filter((a) => a.type === 'code').length,
      workflows: active.filter((a) => a.type === 'workflow').length,
      templates: active.filter((a) => a.type === 'template').length,
      favorites: active.filter((a) => a.isFavorite).length,
      trash: assets.filter((a) => a.status === 'trash').length,
    }
  }, [assets])
}
