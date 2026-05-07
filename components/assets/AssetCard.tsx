'use client'
import { useState } from 'react'
import {
  Star,
  Copy,
  MoreHorizontal,
  Check,
  Trash2,
  Edit2,
  ExternalLink,
  Bot,
  MessageSquare,
  Image,
  FileText,
  Code2,
  GitBranch,
  Layout,
  FileJson,
  StickyNote,
  Link2,
  Layers,
  RotateCcw,
  History,
  HardDrive,
  Monitor,
} from 'lucide-react'
import { Asset, AssetType } from '@/types'
import { AssetBadge } from './AssetBadge'
import { cn, formatRelativeTime, formatEditedLabel, assetTypeConfig } from '@/lib/utils'
import { copyToClipboard } from '@/lib/clipboard'
import { useAppStore } from '@/stores/useAppStore'
import { useVersionStore } from '@/stores/useVersionStore'
import { useUserStore } from '@/stores/useUserStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

const typeIcons: Record<AssetType, React.ElementType> = {
  agent: Bot,
  prompt: MessageSquare,
  image: Image,
  markdown: FileText,
  code: Code2,
  workflow: GitBranch,
  template: Layout,
  json: FileJson,
  note: StickyNote,
  link: Link2,
  other: Layers,
}

interface AssetCardProps {
  asset: Asset
}

export function AssetCard({ asset }: AssetCardProps) {
  const { selectedAssetId, setSelectedAsset, toggleFavorite, deleteAsset, restoreAsset, permanentDeleteAsset, showToast, incrementCopyCount, activeSection } =
    useAppStore()
  const { getVersions } = useVersionStore()
  const vault = useUserStore((s) => s.vault)
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const versionCount = getVersions(asset.id).length
  const isVaultSynced = !!(
    vault.vaultEnabled &&
    vault.vaultInitialized &&
    (asset.imagePath || (vault.vaultLastSyncedAt && new Date(asset.updatedAt) <= new Date(vault.vaultLastSyncedAt)))
  )
  const editedLabel = formatEditedLabel(asset.updatedAt, t)

  const isSelected = selectedAssetId === asset.id
  const isTrash = activeSection === 'trash'
  const Icon = typeIcons[asset.type]
  const typeConfig = assetTypeConfig[asset.type]

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = asset.content || asset.systemPrompt || asset.description || ''
    if (!text) return
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      incrementCopyCount(asset.id)
      showToast(`"${asset.title}" copied`)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(asset.id)
    showToast(asset.isFavorite ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    deleteAsset(asset.id)
    showToast(`"${asset.title}" moved to trash`)
  }

  return (
    <>
    <div
      onClick={() => setSelectedAsset(isSelected ? null : asset.id)}
      className={cn(
        'relative group rounded-xl border bg-surface p-4 cursor-pointer transition-all select-none',
        isSelected
          ? 'border-accent-blue/60 bg-accent-blue/5 shadow-glow'
          : 'border-border hover:border-border-soft hover:bg-surface-hover',
        isTrash && 'opacity-75'
      )}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent-blue flex items-center justify-center z-10">
          <Check size={11} className="text-white" />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', typeConfig.bgColor)}>
            <Icon size={13} className={typeConfig.iconColor} />
          </div>
          <AssetBadge type={asset.type} />
        </div>
        {isTrash ? (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); restoreAsset(asset.id); showToast(`"${asset.title}" restored`) }}
              aria-label="Restore"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 transition-colors"
            >
              <RotateCcw size={11} /> {t('card.restore')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDeleteOpen(true) }}
              aria-label="Delete permanently"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-danger bg-danger/10 hover:bg-danger/20 transition-colors"
            >
              <Trash2 size={11} /> {t('card.deletePerm')}
            </button>
          </div>
        ) : (
          <div className={cn('flex items-center gap-0.5', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
            <button
              onClick={handleFavorite}
              aria-label={asset.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="w-6 h-6 flex items-center justify-center rounded text-text-dim hover:text-yellow-400 transition-colors"
            >
              <Star
                size={13}
                className={asset.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}
              />
            </button>
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
                aria-label="More options"
                className="w-6 h-6 flex items-center justify-center rounded text-text-dim hover:text-text-muted transition-colors"
              >
                <MoreHorizontal size={13} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-7 z-20 w-40 rounded-xl bg-surface border border-border shadow-xl py-1">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setSelectedAsset(asset.id) }}
                    >
                      <ExternalLink size={12} /> {t('card.openDetail')}
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}
                    >
                      <Edit2 size={12} /> {t('card.edit')}
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors"
                      onClick={handleDelete}
                    >
                      <Trash2 size={12} /> {t('card.moveToTrash')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Always-visible favorite star (when favorited) */}
      {asset.isFavorite && !isSelected && (
        <div className="absolute top-3 right-3 group-hover:opacity-0 transition-opacity">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
        </div>
      )}

      {/* Image preview for image type */}
      {asset.type === 'image' && asset.imageColor && (
        <div
          className="w-full h-20 rounded-lg mb-2.5 flex items-center justify-center text-text-dim"
          style={{ background: `linear-gradient(135deg, ${asset.imageColor}, #0E1421)` }}
        >
          <Image size={24} className="opacity-30" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-semibold text-text-main mb-1 truncate pr-4">{asset.title}</h3>

      {/* Description */}
      <p className="text-xs text-text-muted line-clamp-2 mb-2.5 leading-relaxed">
        {asset.description}
      </p>

      {/* Tool badges */}
      {asset.tools.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {asset.tools.slice(0, 3).map((tool) => (
            <span
              key={tool}
              className="px-1.5 py-0.5 rounded text-[10px] bg-accent-blue/10 text-blue-400 border border-accent-blue/15"
            >
              {tool}
            </span>
          ))}
          {asset.tools.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] text-text-dim">
              +{asset.tools.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {asset.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[10px] bg-surface-soft text-text-dim border border-border"
            >
              #{tag}
            </span>
          ))}
          {asset.tags.length > 3 && (
            <span className="text-[10px] text-text-dim">+{asset.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-text-dim">
          {formatRelativeTime(asset.lastUsedAt || asset.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          {asset.usageCount > 0 && (
            <span className="text-[10px] text-text-dim">{asset.usageCount} {t('card.uses')}</span>
          )}
          {!isTrash && (
            <button
              onClick={handleCopy}
              aria-label="Copy content"
              className={cn(
                'w-6 h-6 flex items-center justify-center rounded transition-all',
                'opacity-0 group-hover:opacity-100',
                copied ? 'text-green-400' : 'text-text-dim hover:text-text-muted'
              )}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </button>
          )}
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2.5 mt-1.5">
        <span className="text-[10px] text-text-dim truncate">{editedLabel}</span>
        {versionCount > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-text-dim flex-shrink-0">
            <History size={9} />
            {versionCount}
          </span>
        )}
        <span className={cn(
          'flex items-center gap-0.5 text-[10px] flex-shrink-0 ml-auto',
          isVaultSynced ? 'text-green-400/70' : 'text-text-dim'
        )}>
          {isVaultSynced
            ? <><HardDrive size={9} /><span className="hidden sm:inline">{t('status.savedToVault')}</span></>
            : <><Monitor size={9} /><span className="hidden sm:inline">{t('status.localOnly')}</span></>
          }
        </span>
      </div>
    </div>

    <ConfirmModal
      open={confirmDeleteOpen}
      onClose={() => setConfirmDeleteOpen(false)}
      onConfirm={() => { permanentDeleteAsset(asset.id); showToast(`"${asset.title}" permanently deleted`) }}
      title="Permanently delete asset?"
      message={`"${asset.title}" will be deleted forever. This cannot be undone.`}
      confirmLabel="Delete Forever"
      requireWord="DELETE"
    />
    </>
  )
}
