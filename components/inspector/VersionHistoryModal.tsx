'use client'
import { useState } from 'react'
import { X, RotateCcw, Eye, Copy, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Asset, AssetVersion } from '@/types'
import { useAppStore } from '@/stores/useAppStore'
import { useVersionStore } from '@/stores/useVersionStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { cn, formatRelativeTime, assetTypeConfig } from '@/lib/utils'
import { copyToClipboard } from '@/lib/clipboard'

interface VersionHistoryModalProps {
  asset: Asset
  onClose: () => void
}

function versionCopyText(snapshot: Asset): string {
  if (snapshot.type === 'agent') {
    return [snapshot.systemPrompt, snapshot.instructions].filter(Boolean).join('\n\n---\n\n')
  }
  if (snapshot.type === 'prompt' || snapshot.type === 'image') {
    return [snapshot.content, snapshot.negativePrompt && `Negative: ${snapshot.negativePrompt}`]
      .filter(Boolean)
      .join('\n\n')
  }
  return snapshot.content ?? ''
}

function VersionRow({
  version,
  index,
  onRestore,
}: {
  version: AssetVersion
  index: number
  onRestore: (v: AssetVersion) => void
}) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const snap = version.snapshot
  const config = assetTypeConfig[snap.type]

  const handleCopy = async () => {
    const text = versionCopyText(snap)
    if (text) {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="border-b border-border last:border-0">
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Index badge */}
        <div className="w-6 h-6 rounded-full bg-surface-soft border border-border flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] text-text-dim font-mono">{index + 1}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-text-main truncate">{snap.title}</span>
            <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-semibold border', config.badgeClass)}>
              {config.label}
            </span>
            {version.reason === 'restore' && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {t('versions.savedBefore')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={10} className="text-text-dim" />
            <span className="text-[10px] text-text-dim">{formatRelativeTime(version.createdAt)}</span>
            <span className="text-[10px] text-text-dim">· v{snap.version}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
            title={t('versions.view')}
          >
            {expanded ? <ChevronUp size={12} /> : <Eye size={12} />}
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              'w-6 h-6 flex items-center justify-center rounded-lg transition-all',
              copied
                ? 'text-green-400'
                : 'text-text-dim hover:text-text-muted hover:bg-surface-hover'
            )}
            title={t('versions.copy')}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
          <button
            onClick={() => onRestore(version)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-text-dim hover:text-accent-blue hover:bg-accent-blue/10 transition-all"
            title={t('versions.restore')}
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>

      {/* Expanded preview */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {snap.description && (
            <div>
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-1">
                Description
              </div>
              <div className="text-xs text-text-muted">{snap.description}</div>
            </div>
          )}
          {snap.type === 'agent' && (
            <>
              {snap.systemPrompt && (
                <div>
                  <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-1">
                    System Prompt
                  </div>
                  <div className="text-xs text-text-muted font-mono bg-background rounded-lg p-2 border border-border whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {snap.systemPrompt}
                  </div>
                </div>
              )}
              {snap.instructions && (
                <div>
                  <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-1">
                    Instructions
                  </div>
                  <div className="text-xs text-text-muted font-mono bg-background rounded-lg p-2 border border-border whitespace-pre-wrap max-h-24 overflow-y-auto">
                    {snap.instructions}
                  </div>
                </div>
              )}
            </>
          )}
          {snap.type !== 'agent' && snap.content && (
            <div>
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-1">
                {snap.type === 'image' ? 'Generation Prompt' : snap.type === 'code' ? 'Code' : 'Content'}
              </div>
              <div className="text-xs text-text-muted font-mono bg-background rounded-lg p-2 border border-border whitespace-pre-wrap max-h-32 overflow-y-auto">
                {snap.content}
              </div>
            </div>
          )}
          {(snap.type === 'prompt' || snap.type === 'image') && snap.negativePrompt && (
            <div>
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-1">
                Negative Prompt
              </div>
              <div className="text-xs text-text-muted font-mono bg-background rounded-lg p-2 border border-danger/15 whitespace-pre-wrap max-h-20 overflow-y-auto">
                {snap.negativePrompt}
              </div>
            </div>
          )}
          {snap.notes && (
            <div>
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-1">
                Notes
              </div>
              <div className="text-xs text-text-muted whitespace-pre-wrap">{snap.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function VersionHistoryModal({ asset, onClose }: VersionHistoryModalProps) {
  const { t } = useI18n()
  const { updateAsset, showToast } = useAppStore()
  const { getVersions, saveVersion } = useVersionStore()
  const [confirmVersion, setConfirmVersion] = useState<AssetVersion | null>(null)

  const versions = getVersions(asset.id)

  const handleRestore = (version: AssetVersion) => {
    setConfirmVersion(version)
  }

  const confirmRestore = async () => {
    if (!confirmVersion) return

    // Snapshot current state before restoring
    saveVersion(asset, 'restore')

    // Restore
    const snap = confirmVersion.snapshot
    const updates: Partial<Asset> = {
      title:        snap.title,
      description:  snap.description,
      content:      snap.content,
      systemPrompt: snap.systemPrompt,
      instructions: snap.instructions,
      negativePrompt: snap.negativePrompt,
      exampleOutput:  snap.exampleOutput,
      tools:          snap.tools,
      tags:           snap.tags,
      notes:          snap.notes,
      version:        snap.version,
      variables:      snap.variables,
      language:       snap.language,
    }
    updateAsset(asset.id, updates)

    // Vault sync
    try {
      const updated = useAppStore.getState().assets.find((a) => a.id === asset.id)
      if (updated) {
        const { updateVaultAsset } = await import('@/lib/vaultClient')
        await updateVaultAsset({ ...updated, ...updates, updatedAt: new Date().toISOString() })
      }
    } catch { /* vault optional */ }

    import('@/stores/useNotificationStore').then(({ useNotificationStore }) => {
      useNotificationStore.getState().addNotification({
        type: 'asset_created',
        title: t('versions.restored'),
        message: `"${asset.title}" ${t('versions.restored').toLowerCase()}.`,
      })
    })

    showToast(t('versions.restored'))
    setConfirmVersion(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-text-main">{t('versions.title')}</h2>
            <p className="text-[11px] text-text-dim mt-0.5 truncate max-w-[320px]">{asset.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Version list */}
        <div className="flex-1 overflow-y-auto">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-surface-soft border border-border flex items-center justify-center mb-3">
                <Clock size={18} className="text-text-dim" />
              </div>
              <p className="text-sm font-medium text-text-muted">{t('versions.title')}</p>
              <p className="text-xs text-text-dim mt-1.5 max-w-[300px] leading-relaxed">
                {t('versions.noVersions')}
              </p>
            </div>
          ) : (
            <div>
              {versions.map((v, i) => (
                <VersionRow
                  key={v.id}
                  version={v}
                  index={i}
                  onRestore={handleRestore}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex-shrink-0 flex items-center justify-between">
          <span className="text-[10px] text-text-dim">{t('versions.maxVersions')}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-text-muted hover:text-text-main transition-colors"
          >
            {t('versions.close')}
          </button>
        </div>
      </div>

      {/* Confirm restore dialog */}
      {confirmVersion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmVersion(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-150">
            <h3 className="text-sm font-semibold text-text-main mb-2">{t('versions.restore')}?</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-5">
              {t('versions.confirmRestore')}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmVersion(null)}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmRestore}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-accent-blue hover:bg-blue-500 text-white transition-colors"
              >
                {t('versions.restore')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
