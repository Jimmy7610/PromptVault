'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { useUserStore } from '@/stores/useUserStore'
import { translate } from '@/lib/i18n/translations'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { StatsRow } from '@/components/dashboard/StatsCard'
import { AssetGrid } from '@/components/assets/AssetGrid'
import { AssetDetailPanel } from '@/components/inspector/AssetDetailPanel'
import { Toast } from '@/components/ui/Toast'
import { NewAssetModal } from '@/components/forms/NewAssetModal'
import { CreateFromClipboardModal } from '@/components/forms/CreateFromClipboardModal'
import { LandingPage } from '@/components/landing/LandingPage'
import { VaultAutoLoader } from '@/components/system/VaultAutoLoader'

function LoadingSplash() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet animate-pulse" />
    </div>
  )
}

export default function PromptVaultApp() {
  const { selectedAssetId, activeSection } = useAppStore()
  const hasHydrated = useUserStore((s) => s._hasHydrated)
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)
  const accentColor = useUserStore((s) => s.settings.accentColor)

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor)
  }, [accentColor])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const { openNewAssetModal, selectedAssetId, setSelectedAsset, toggleFavorite, assets } =
        useAppStore.getState()

      switch (e.key) {
        case 'n':
        case 'N':
          openNewAssetModal()
          break
        case 'Escape':
          setSelectedAsset(null)
          break
        case 'f':
        case 'F':
          if (selectedAssetId) {
            const asset = assets.find((a) => a.id === selectedAssetId)
            if (asset) {
              toggleFavorite(selectedAssetId)
              const lang = useUserStore.getState().settings?.language ?? 'en'
              useAppStore
                .getState()
                .showToast(asset.isFavorite ? translate(lang, 'toast.removedFavorites') : translate(lang, 'toast.addedFavorites'))
            }
          }
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Wait for localStorage to be read before deciding which screen to show
  if (!hasHydrated) return <LoadingSplash />

  if (!isLoggedIn) return <LandingPage />

  const showStats = activeSection === 'dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Auto-load vault assets on startup (renders nothing) */}
      <VaultAutoLoader />

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Top bar */}
        <Topbar />

        {/* Filter bar */}
        <FilterBar />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          {showStats && <StatsRow />}
          <AssetGrid />
        </main>
      </div>

      {/* Right detail panel (conditional) */}
      {selectedAssetId && <AssetDetailPanel />}

      {/* Global overlays */}
      <Toast />
      <NewAssetModal />
      <CreateFromClipboardModal />
    </div>
  )
}
