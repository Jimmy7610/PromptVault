'use client'
import { useRef, useState } from 'react'
import {
  Download,
  Image as ImageIcon,
  Upload,
  X,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Asset } from '@/types'
import { CopyButton } from '@/components/ui/CopyButton'
import { formatDate, formatRelativeTime, cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useUserStore } from '@/stores/useUserStore'
import { updateVaultAsset } from '@/lib/vaultClient'
import { AssetStatusRow } from './AssetStatusRow'
import { useI18n } from '@/lib/i18n/useI18n'

interface ImageDetailProps {
  asset: Asset
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 20 * 1024 * 1024

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ImageDetail({ asset }: ImageDetailProps) {
  const { updateAsset, showToast } = useAppStore()
  const { vault } = useUserStore()
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const hasImage = !!asset.imagePath
  const vaultReady = vault.vaultEnabled && vault.vaultInitialized

  const triggerFilePicker = () => {
    if (!vaultReady) {
      setUploadError(
        'Image attachments require Local Vault Storage. Enable and initialize Vault in Settings → Vault Storage first.'
      )
      return
    }
    setUploadError('')
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Unsupported format. Please use PNG, JPG, or WebP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setUploadError(`File too large (${formatBytes(file.size)}). Maximum is 20 MB.`)
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`/api/vault/images/${asset.id}`, { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setUploadError(data.error ?? 'Upload failed.')
        return
      }

      const updates: Partial<Asset> = {
        imagePath:       data.imagePath,
        imageFileName:   data.imageFileName,
        imageMimeType:   data.imageMimeType,
        imageSize:       data.imageSize,
        imageUploadedAt: data.imageUploadedAt,
      }

      updateAsset(asset.id, updates)

      // Sync updated asset to vault file
      if (vault.vaultEnabled) {
        const updated = useAppStore.getState().assets.find((a) => a.id === asset.id)
        if (updated) updateVaultAsset(updated as Asset).catch(console.error)
      }

      showToast('Image attached')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async () => {
    if (!hasImage) return
    try {
      const res = await fetch(`/api/vault/images/${asset.id}`)
      if (!res.ok) throw new Error('Fetch failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = asset.imageFileName ?? `image-${asset.id}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      showToast('Download failed', 'error')
    }
  }

  const handleRemove = () => {
    // Move image folder to .deleted (non-blocking)
    fetch(`/api/vault/images/${asset.id}`, { method: 'DELETE' }).catch(console.error)

    const updates: Partial<Asset> = {
      imagePath:       undefined,
      imageFileName:   undefined,
      imageMimeType:   undefined,
      imageSize:       undefined,
      imageUploadedAt: undefined,
    }

    updateAsset(asset.id, updates)

    if (vault.vaultEnabled) {
      const updated = useAppStore.getState().assets.find((a) => a.id === asset.id)
      if (updated) updateVaultAsset(updated as Asset).catch(console.error)
    }

    showToast('Image removed')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/15 text-green-300 border border-green-500/25">
            Image
          </span>
        </div>
        <h2 className="text-base font-bold text-text-main mb-1">{asset.title}</h2>
        <p className="text-xs text-text-muted leading-relaxed mb-1">{asset.description}</p>
        <AssetStatusRow asset={asset} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Image area */}
        <div className="px-4 pt-4">
          {hasImage ? (
            <div className="mb-4">
              {/* Preview */}
              <div className="w-full rounded-xl border border-border overflow-hidden bg-background mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={asset.imagePath}
                  src={`/api/vault/images/${asset.id}`}
                  alt={asset.title}
                  className="w-full object-contain max-h-72"
                />
              </div>

              {/* File metadata */}
              <div className="bg-surface-soft rounded-xl border border-border px-3 py-2.5 mb-3 space-y-1.5">
                {asset.imageFileName && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-dim flex-shrink-0">{t('inspector.imageFile')}</span>
                    <span className="text-text-muted font-mono truncate max-w-[160px] text-right">{asset.imageFileName}</span>
                  </div>
                )}
                {asset.imageMimeType && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-dim">{t('inspector.imageType')}</span>
                    <span className="text-text-muted">{asset.imageMimeType}</span>
                  </div>
                )}
                {asset.imageSize != null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-dim">{t('inspector.imageSize')}</span>
                    <span className="text-text-muted">{formatBytes(asset.imageSize)}</span>
                  </div>
                )}
                {asset.imageUploadedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-text-dim">{t('inspector.imageAttached')}</span>
                    <span className="text-text-muted">{formatRelativeTime(asset.imageUploadedAt)}</span>
                  </div>
                )}
              </div>

              {/* Image action buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={triggerFilePicker}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-xs text-text-muted hover:text-text-main hover:border-border-soft transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                  {t('inspector.imageReplace')}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-xs text-text-muted hover:text-text-main hover:border-border-soft transition-colors"
                >
                  <Download size={11} /> {t('inspector.imageDownload')}
                </button>
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-xs text-text-muted hover:text-danger hover:border-danger/30 transition-colors"
                >
                  <X size={11} /> {t('inspector.imageRemove')}
                </button>
              </div>
            </div>
          ) : (
            /* No image placeholder */
            <div className="mb-4">
              <div
                className="w-full h-44 rounded-xl border border-border flex flex-col items-center justify-center mb-2.5"
                style={{
                  background: asset.imageColor
                    ? `linear-gradient(135deg, ${asset.imageColor} 0%, #0E1421 100%)`
                    : 'linear-gradient(135deg, #1a0a2e 0%, #0E1421 100%)',
                }}
              >
                <ImageIcon size={28} className="text-white/20 mb-2" />
                <div className="text-[11px] text-white/30 mb-3">{t('inspector.imageNoImage')}</div>
                <button
                  onClick={triggerFilePicker}
                  disabled={uploading}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white/90 border border-white/15',
                    'disabled:opacity-50'
                  )}
                >
                  {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                  {uploading ? t('inspector.imageUploading') : t('inspector.imageAdd')}
                </button>
              </div>
              <p className="text-[10px] text-text-dim text-center">
                Attach a generated result, reference image, or moodboard · PNG · JPG · WebP · max 20 MB
              </p>
            </div>
          )}

          {/* Upload error / vault warning */}
          {uploadError && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-3">
              <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-400/90 leading-snug">{uploadError}</p>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Generation Prompt */}
        {asset.content && (
          <div className="px-4 mb-4">
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              {t('inspector.generationPrompt')}
            </div>
            <div className="text-xs text-text-muted bg-background rounded-lg p-3 border border-border leading-relaxed font-mono">
              {asset.content}
            </div>
          </div>
        )}

        {/* Negative Prompt */}
        {asset.negativePrompt && (
          <div className="px-4 mb-4">
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              {t('inspector.negativePrompt')}
            </div>
            <div className="text-xs text-text-muted bg-background rounded-lg p-3 border border-danger/15 leading-relaxed font-mono">
              {asset.negativePrompt}
            </div>
          </div>
        )}

        {/* Tools + Tags */}
        <div className="px-4 mb-4">
          {asset.tools.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                {t('inspector.tools')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {asset.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded text-[10px] bg-accent-blue/10 text-blue-400 border border-accent-blue/15"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          {asset.tags.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                {t('inspector.tags')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] bg-surface-soft text-text-dim border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="px-4 pb-4">
          <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
            {t('inspector.metadata')}
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-dim">{t('inspector.created')}</span>
              <span className="text-text-muted">{formatDate(asset.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">{t('inspector.updated')}</span>
              <span className="text-text-muted">{formatRelativeTime(asset.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-surface">
        <div className="flex flex-wrap gap-2">
          {asset.content && <CopyButton text={asset.content} label={t('inspector.imageCopyPrompt')} assetId={asset.id} />}
          {hasImage ? (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-text-muted hover:text-text-main text-xs transition-colors"
            >
              <Download size={11} /> {t('inspector.imageDownloadFull')}
            </button>
          ) : (
            <button
              onClick={triggerFilePicker}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-text-muted hover:text-text-main text-xs transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
              {t('inspector.imageAdd')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
