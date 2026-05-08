'use client'
/**
 * VaultAutoLoader
 *
 * Silently loads assets from Local Vault Storage on app startup — once per
 * browser session. Runs only when vault is both enabled and initialized.
 * Merges by ID, preferring the asset with the newer updatedAt timestamp.
 * Renders nothing; all side effects are via stores and toasts.
 */
import { useEffect, useRef } from 'react'
import { Asset } from '@/types'
import { useAppStore } from '@/stores/useAppStore'
import { useUserStore } from '@/stores/useUserStore'
import { useCollectionStore } from '@/stores/useCollectionStore'
import { getVaultAssets } from '@/lib/vaultClient'
import { loadCollectionsFromVault } from '@/lib/vaultCollections'
import { useI18n } from '@/lib/i18n/useI18n'

export function VaultAutoLoader() {
  const hasRun = useRef(false)
  const { t } = useI18n()

  const hasHydrated = useUserStore((s) => s._hasHydrated)
  const vaultEnabled = useUserStore((s) => s.vault.vaultEnabled)
  const vaultInitialized = useUserStore((s) => s.vault.vaultInitialized)

  useEffect(() => {
    // Wait for localStorage to be read and ensure vault is active
    if (!hasHydrated) return
    if (!vaultEnabled || !vaultInitialized) return
    // Run at most once per browser session
    if (hasRun.current) return
    hasRun.current = true

    ;(async () => {
      try {
        const [vaultAssets, vaultCollections] = await Promise.all([
          getVaultAssets(true) as Promise<Asset[]>,
          loadCollectionsFromVault(),
        ])

        // Merge assets
        if (vaultAssets.length) {
          const { assets: local } = useAppStore.getState()
          const merged = [...local]
          for (const vAsset of vaultAssets) {
            if (!vAsset.id) continue
            const idx = merged.findIndex((a) => a.id === vAsset.id)
            if (idx >= 0) {
              const localTs = merged[idx].updatedAt ? new Date(merged[idx].updatedAt).getTime() : 0
              const vaultTs = vAsset.updatedAt ? new Date(vAsset.updatedAt).getTime() : 0
              if (vaultTs >= localTs) merged[idx] = { ...merged[idx], ...vAsset }
            } else {
              merged.push(vAsset)
            }
          }
          useAppStore.setState({ assets: merged })
        }

        // Merge collections
        if (vaultCollections.length) {
          useCollectionStore.getState().mergeCollections(vaultCollections)
        }

        useAppStore.getState().showToast(t('vault.autoLoadSuccess'))
      } catch {
        useAppStore.getState().showToast(t('vault.autoLoadError'), 'error')
      }
    })()
  }, [hasHydrated, vaultEnabled, vaultInitialized, t])

  return null
}
