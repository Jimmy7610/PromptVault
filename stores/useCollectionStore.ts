'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Collection } from '@/types'
import { generateId } from '@/lib/utils'

function isVaultEnabled(): boolean {
  try {
    // Lazy import to avoid circular dependency
    const { useUserStore } = require('@/stores/useUserStore')
    return useUserStore.getState().vault?.vaultEnabled === true
  } catch {
    return false
  }
}

interface CollectionState {
  collections: Collection[]
  selectedCollectionId: string | null

  createCollection: (data: Pick<Collection, 'name' | 'description' | 'color' | 'icon'>) => string
  updateCollection: (id: string, data: Partial<Omit<Collection, 'id' | 'createdAt'>>) => void
  deleteCollection: (id: string) => void
  addAssetToCollection: (collectionId: string, assetId: string) => void
  removeAssetFromCollection: (collectionId: string, assetId: string) => void
  setAssetCollections: (assetId: string, collectionIds: string[]) => void
  getCollectionById: (id: string) => Collection | undefined
  getCollectionsForAsset: (assetId: string) => Collection[]
  setSelectedCollection: (id: string | null) => void
  /** Replace all collections at once — used by VaultAutoLoader. */
  mergeCollections: (incoming: Collection[]) => void
}

function syncToVault(collections: Collection[]) {
  if (!isVaultEnabled()) return
  import('@/lib/vaultCollections').then(({ saveCollectionsToVault }) => {
    saveCollectionsToVault(collections).catch(console.error)
  })
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collections: [],
      selectedCollectionId: null,

      createCollection: (data) => {
        const id = generateId()
        const now = new Date().toISOString()
        const collection: Collection = {
          id,
          name: data.name.trim(),
          description: data.description?.trim() ?? '',
          color: data.color ?? 'blue',
          icon: data.icon ?? '',
          assetIds: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ collections: [...state.collections, collection] }))
        syncToVault(get().collections)
        return id
      },

      updateCollection: (id, data) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          ),
        }))
        syncToVault(get().collections)
      },

      deleteCollection: (id) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
          selectedCollectionId: state.selectedCollectionId === id ? null : state.selectedCollectionId,
        }))
        syncToVault(get().collections)
      },

      addAssetToCollection: (collectionId, assetId) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId && !c.assetIds.includes(assetId)
              ? { ...c, assetIds: [...c.assetIds, assetId], updatedAt: new Date().toISOString() }
              : c
          ),
        }))
        syncToVault(get().collections)
      },

      removeAssetFromCollection: (collectionId, assetId) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, assetIds: c.assetIds.filter((id) => id !== assetId), updatedAt: new Date().toISOString() }
              : c
          ),
        }))
        syncToVault(get().collections)
      },

      setAssetCollections: (assetId, collectionIds) => {
        set((state) => ({
          collections: state.collections.map((c) => {
            const shouldBe = collectionIds.includes(c.id)
            const isNow   = c.assetIds.includes(assetId)
            if (shouldBe === isNow) return c
            return {
              ...c,
              assetIds: shouldBe
                ? [...c.assetIds, assetId]
                : c.assetIds.filter((id) => id !== assetId),
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
        syncToVault(get().collections)
      },

      getCollectionById: (id) => get().collections.find((c) => c.id === id),

      getCollectionsForAsset: (assetId) =>
        get().collections.filter((c) => c.assetIds.includes(assetId)),

      setSelectedCollection: (id) => set({ selectedCollectionId: id }),

      mergeCollections: (incoming) => {
        const { collections: local } = get()
        const merged = [...local]
        for (const vCol of incoming) {
          const idx = merged.findIndex((c) => c.id === vCol.id)
          if (idx >= 0) {
            const localTs = new Date(merged[idx].updatedAt).getTime()
            const vaultTs = new Date(vCol.updatedAt).getTime()
            if (vaultTs >= localTs) merged[idx] = vCol
          } else {
            merged.push(vCol)
          }
        }
        set({ collections: merged })
      },
    }),
    {
      name: 'promptvault-collections-v1',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      }),
    }
  )
)
