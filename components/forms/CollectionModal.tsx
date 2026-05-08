'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Collection } from '@/types'
import { useCollectionStore } from '@/stores/useCollectionStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { cn } from '@/lib/utils'

const COLORS = [
  { id: 'blue',   bg: 'bg-blue-500',   ring: 'ring-blue-400' },
  { id: 'violet', bg: 'bg-violet-500', ring: 'ring-violet-400' },
  { id: 'green',  bg: 'bg-emerald-500',ring: 'ring-emerald-400' },
  { id: 'amber',  bg: 'bg-amber-500',  ring: 'ring-amber-400' },
  { id: 'red',    bg: 'bg-red-500',    ring: 'ring-red-400' },
  { id: 'pink',   bg: 'bg-pink-500',   ring: 'ring-pink-400' },
  { id: 'cyan',   bg: 'bg-cyan-500',   ring: 'ring-cyan-400' },
  { id: 'slate',  bg: 'bg-slate-500',  ring: 'ring-slate-400' },
]

interface CollectionModalProps {
  /** When provided, the modal is in edit mode. */
  collection?: Collection
  open: boolean
  onClose: () => void
}

const INPUT_CLS =
  'w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all'
const LABEL_CLS = 'block text-xs font-medium text-text-muted mb-1.5'

export function CollectionModal({ collection, open, onClose }: CollectionModalProps) {
  const { createCollection, updateCollection } = useCollectionStore()
  const { t } = useI18n()
  const isEdit = !!collection

  const [name, setName]     = useState(collection?.name ?? '')
  const [desc, setDesc]     = useState(collection?.description ?? '')
  const [color, setColor]   = useState(collection?.color ?? 'blue')
  const [error, setError]   = useState('')

  // Sync fields when switching between create/edit
  useEffect(() => {
    if (open) {
      setName(collection?.name ?? '')
      setDesc(collection?.description ?? '')
      setColor(collection?.color ?? 'blue')
      setError('')
    }
  }, [open, collection])

  if (!open) return null

  const handleSave = () => {
    if (!name.trim()) {
      setError(t('collectionModal.nameRequired'))
      return
    }
    if (isEdit && collection) {
      updateCollection(collection.id, { name: name.trim(), description: desc.trim(), color })
    } else {
      createCollection({ name: name.trim(), description: desc.trim(), color, icon: '' })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-main">
            {isEdit ? t('collectionModal.editTitle') : t('collectionModal.createTitle')}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className={LABEL_CLS}>
              {t('collectionModal.nameLabel')} <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder={t('collectionModal.namePlaceholder')}
              autoFocus
              className={cn(INPUT_CLS, error && 'border-danger/50')}
            />
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={LABEL_CLS}>{t('collectionModal.descLabel')}</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder={t('collectionModal.descPlaceholder')}
              className={cn(INPUT_CLS, 'resize-none')}
            />
          </div>

          {/* Colour picker */}
          <div>
            <label className={LABEL_CLS}>{t('collectionModal.colorLabel')}</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    c.bg,
                    color === c.id && `ring-2 ring-offset-2 ring-offset-surface ${c.ring}`
                  )}
                  aria-label={c.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
          >
            {t('collectionModal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-accent-blue hover:bg-blue-500 text-white transition-colors"
          >
            {isEdit ? t('collectionModal.saveEdit') : t('collectionModal.saveCreate')}
          </button>
        </div>
      </div>
    </div>
  )
}
