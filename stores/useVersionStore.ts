'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Asset, AssetVersion } from '@/types'
import { generateId } from '@/lib/utils'

const MAX_VERSIONS_PER_ASSET = 25

interface VersionState {
  // Map of assetId → versions sorted newest-first
  versions: Record<string, AssetVersion[]>

  /** Save a snapshot of an asset before it is changed. */
  saveVersion: (asset: Asset, reason: 'edit' | 'restore') => void

  /** Get all versions for an asset, newest first. */
  getVersions: (assetId: string) => AssetVersion[]

  /** Remove all stored versions for a deleted asset. */
  deleteVersionsForAsset: (assetId: string) => void
}

export const useVersionStore = create<VersionState>()(
  persist(
    (set, get) => ({
      versions: {},

      saveVersion: (asset, reason) => {
        const version: AssetVersion = {
          id: generateId(),
          assetId: asset.id,
          createdAt: new Date().toISOString(),
          reason,
          snapshot: { ...asset },
        }

        set((state) => {
          const existing = state.versions[asset.id] ?? []
          // Prepend newest, cap at MAX
          const updated = [version, ...existing].slice(0, MAX_VERSIONS_PER_ASSET)
          return { versions: { ...state.versions, [asset.id]: updated } }
        })

        // Fire-and-forget: also write to vault versions folder if vault is enabled
        import('@/stores/useUserStore').then(({ useUserStore }) => {
          if (useUserStore.getState().vault?.vaultEnabled) {
            fetch(`/api/vault/versions/${asset.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(version),
            }).catch(() => {/* vault write is optional */})
          }
        })
      },

      getVersions: (assetId) => {
        return get().versions[assetId] ?? []
      },

      deleteVersionsForAsset: (assetId) => {
        set((state) => {
          const { [assetId]: _, ...rest } = state.versions
          return { versions: rest }
        })
      },
    }),
    {
      name: 'promptvault-versions',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      }),
    }
  )
)
