import { AssetType } from '@/types'
import { assetTypeConfig } from '@/lib/utils'

interface AssetBadgeProps {
  type: AssetType
  size?: 'sm' | 'md'
}

export function AssetBadge({ type, size = 'sm' }: AssetBadgeProps) {
  const config = assetTypeConfig[type]
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.badgeClass} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {config.label}
    </span>
  )
}
