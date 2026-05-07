'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Asset, AssetType, FilterVisibility, NavSection, SortOption, ToastState, ViewMode } from '@/types'
import { mockAssets } from '@/data/mockAssets'
import { generateId } from '@/lib/utils'
import { useUserStore } from '@/stores/useUserStore'

/** Returns true when the user has vault mode enabled. */
function isVaultEnabled(): boolean {
  try {
    return useUserStore.getState().vault?.vaultEnabled === true
  } catch {
    return false
  }
}

interface AppState {
  assets: Asset[]
  selectedAssetId: string | null
  searchQuery: string
  activeSection: NavSection
  activeTypeFilter: AssetType | 'all'
  activeSortBy: SortOption
  viewMode: ViewMode
  toast: ToastState | null
  isNewAssetModalOpen: boolean
  newAssetType: AssetType | null

  // Advanced filters
  filterFavoriteOnly: boolean
  filterTags: string[]
  filterTools: string[]
  filterVisibility: FilterVisibility

  setSelectedAsset: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setActiveSection: (section: NavSection) => void
  setTypeFilter: (type: AssetType | 'all') => void
  setSortBy: (sort: SortOption) => void
  setViewMode: (mode: ViewMode) => void
  toggleFavorite: (id: string) => void
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'copyCount'>) => string
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  restoreAsset: (id: string) => void
  permanentDeleteAsset: (id: string) => void
  emptyTrash: () => void
  clearAllAssets: () => void
  incrementCopyCount: (id: string) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void
  openNewAssetModal: (type?: AssetType) => void
  closeNewAssetModal: () => void

  // Advanced filter actions
  setFilterFavoriteOnly: (v: boolean) => void
  setFilterTags: (tags: string[]) => void
  setFilterTools: (tools: string[]) => void
  setFilterVisibility: (v: FilterVisibility) => void
  clearAdvancedFilters: () => void
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      assets: mockAssets,
      selectedAssetId: '1',
      searchQuery: '',
      activeSection: 'dashboard',
      activeTypeFilter: 'all',
      activeSortBy: 'lastUsed',
      viewMode: 'grid',
      toast: null,
      isNewAssetModalOpen: false,
      newAssetType: null,
      filterFavoriteOnly: false,
      filterTags: [],
      filterTools: [],
      filterVisibility: 'all',

      setSelectedAsset: (id) => set({ selectedAssetId: id }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setActiveSection: (section) =>
        set({ activeSection: section, selectedAssetId: null, activeTypeFilter: 'all' }),

      setTypeFilter: (type) => set({ activeTypeFilter: type }),

      setSortBy: (sort) => set({ activeSortBy: sort }),

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleFavorite: (id) =>
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
          ),
        })),

      addAsset: (assetData) => {
        const id = generateId()
        const now = new Date().toISOString()
        const newAsset: Asset = {
          ...assetData,
          id,
          createdAt: now,
          updatedAt: now,
          usageCount: 0,
          copyCount: 0,
        }
        set((state) => ({ assets: [newAsset, ...state.assets] }))
        import('@/stores/useNotificationStore').then(({ useNotificationStore }) => {
          useNotificationStore.getState().addNotification({
            type: 'asset_created',
            title: 'Asset created',
            message: `"${assetData.title}" was added to your library.`,
          })
        })
        // Vault: write file if enabled (fire-and-forget)
        if (isVaultEnabled()) {
          import('@/lib/vaultClient').then(({ createVaultAsset }) => {
            createVaultAsset(newAsset).catch(console.error)
          })
        }
        return id
      },

      updateAsset: (id, updates) =>
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        })),

      deleteAsset: (id) => {
        const asset = get().assets.find((a) => a.id === id)
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, status: 'trash', trashedAt: new Date().toISOString() } : a
          ),
          selectedAssetId: state.selectedAssetId === id ? null : state.selectedAssetId,
        }))
        if (asset) {
          import('@/stores/useNotificationStore').then(({ useNotificationStore }) => {
            useNotificationStore.getState().addNotification({
              type: 'asset_trashed',
              title: 'Moved to trash',
              message: `"${asset.title}" was moved to trash.`,
            })
          })
          // Vault: mark trashed in index
          if (isVaultEnabled()) {
            import('@/lib/vaultClient').then(({ trashVaultAsset }) => {
              trashVaultAsset(id).catch(console.error)
            })
          }
        }
      },

      restoreAsset: (id) => {
        const asset = get().assets.find((a) => a.id === id)
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, status: 'active', trashedAt: undefined } : a
          ),
        }))
        if (asset) {
          import('@/stores/useNotificationStore').then(({ useNotificationStore }) => {
            useNotificationStore.getState().addNotification({
              type: 'asset_restored',
              title: 'Asset restored',
              message: `"${asset.title}" was restored from trash.`,
            })
          })
          // Vault: clear trashedAt in index
          if (isVaultEnabled()) {
            import('@/lib/vaultClient').then(({ restoreVaultAsset }) => {
              restoreVaultAsset(id).catch(console.error)
            })
          }
        }
      },

      permanentDeleteAsset: (id) => {
        const asset = get().assets.find((a) => a.id === id)
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
          selectedAssetId: state.selectedAssetId === id ? null : state.selectedAssetId,
        }))
        if (asset) {
          import('@/stores/useNotificationStore').then(({ useNotificationStore }) => {
            useNotificationStore.getState().addNotification({
              type: 'asset_deleted',
              title: 'Asset deleted',
              message: `"${asset.title}" was permanently deleted.`,
            })
          })
          // Vault: move file to .deleted and remove from index
          if (isVaultEnabled()) {
            import('@/lib/vaultClient').then(({ deleteVaultAsset }) => {
              deleteVaultAsset(id).catch(console.error)
            })
          }
        }
      },

      emptyTrash: () =>
        set((state) => ({
          assets: state.assets.filter((a) => a.status !== 'trash'),
          selectedAssetId: null,
        })),

      clearAllAssets: () => set({ assets: [], selectedAssetId: null }),

      incrementCopyCount: (id) =>
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id
              ? { ...a, copyCount: a.copyCount + 1, lastCopiedAt: new Date().toISOString() }
              : a
          ),
        })),

      showToast: (message, type = 'success') => {
        if (toastTimer) clearTimeout(toastTimer)
        set({ toast: { message, type } })
        toastTimer = setTimeout(() => get().hideToast(), 2500)
      },

      hideToast: () => set({ toast: null }),

      openNewAssetModal: (type) =>
        set({ isNewAssetModalOpen: true, newAssetType: type ?? null }),

      closeNewAssetModal: () =>
        set({ isNewAssetModalOpen: false, newAssetType: null }),

      setFilterFavoriteOnly: (v) => set({ filterFavoriteOnly: v }),
      setFilterTags: (tags) => set({ filterTags: tags }),
      setFilterTools: (tools) => set({ filterTools: tools }),
      setFilterVisibility: (v) => set({ filterVisibility: v }),

      clearAdvancedFilters: () =>
        set({ filterFavoriteOnly: false, filterTags: [], filterTools: [], filterVisibility: 'all' }),
    }),
    {
      name: 'promptvault-v1',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({ assets: state.assets }),
    }
  )
)
