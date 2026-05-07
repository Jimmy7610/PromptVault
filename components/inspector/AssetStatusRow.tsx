'use client'
import { HardDrive, History, Monitor } from 'lucide-react'
import { Asset } from '@/types'
import { cn, formatEditedLabel } from '@/lib/utils'
import { useVersionStore } from '@/stores/useVersionStore'
import { useUserStore } from '@/stores/useUserStore'
import { useI18n } from '@/lib/i18n/useI18n'

interface AssetStatusRowProps {
  asset: Asset
}

export function AssetStatusRow({ asset }: AssetStatusRowProps) {
  const { getVersions } = useVersionStore()
  const vault = useUserStore((s) => s.vault)
  const { t } = useI18n()

  const versionCount = getVersions(asset.id).length
  const isVaultSynced = !!(
    vault.vaultEnabled &&
    vault.vaultInitialized &&
    (asset.imagePath || (vault.vaultLastSyncedAt && new Date(asset.updatedAt) <= new Date(vault.vaultLastSyncedAt)))
  )
  const editedLabel = formatEditedLabel(asset.updatedAt, t)

  return (
    <div className="flex items-center gap-3 mt-2.5">
      <span className="text-[10px] text-text-dim truncate">{editedLabel}</span>
      {versionCount > 0 && (
        <span className="flex items-center gap-1 text-[10px] text-text-dim flex-shrink-0">
          <History size={10} />
          {versionCount} {versionCount === 1 ? t('status.versionLabel') : t('status.versionsLabel')}
        </span>
      )}
      <span className={cn(
        'flex items-center gap-1 text-[10px] flex-shrink-0 ml-auto',
        isVaultSynced ? 'text-green-400/80' : 'text-text-dim'
      )}>
        {isVaultSynced
          ? <><HardDrive size={10} /> {t('status.savedToVault')}</>
          : <><Monitor size={10} /> {t('status.localOnly')}</>
        }
      </span>
    </div>
  )
}
