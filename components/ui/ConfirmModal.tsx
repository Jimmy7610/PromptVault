'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/useI18n'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  /** If provided, user must type this word before confirming */
  requireWord?: string
  danger?: boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  requireWord,
  danger = true,
}: ConfirmModalProps) {
  const [typed, setTyped] = useState('')
  const { t } = useI18n()

  useEffect(() => {
    if (!open) setTyped('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const canConfirm = requireWord ? typed.trim().toUpperCase() === requireWord.toUpperCase() : true

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-start justify-between px-5 pt-5 pb-0">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', danger ? 'bg-danger/15' : 'bg-accent-blue/15')}>
            <AlertTriangle size={18} className={danger ? 'text-danger' : 'text-accent-blue'} />
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text-muted transition-colors p-1">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 pt-3 pb-5">
          <h2 className="text-base font-semibold text-text-main mb-2">{title}</h2>
          <p className="text-sm text-text-muted leading-relaxed mb-4">{message}</p>

          {requireWord && (
            <div className="mb-4">
              <label className="block text-xs text-text-muted mb-1.5">
                {t('confirm.typeToConfirm').split('{word}')[0]}
                <span className="font-mono font-bold text-danger">{requireWord}</span>
                {t('confirm.typeToConfirm').split('{word}')[1]}
              </label>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                placeholder={requireWord}
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-danger/50 transition-all font-mono"
              />
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
            >
              {t('confirm.cancel')}
            </button>
            <button
              onClick={() => { if (canConfirm) { onConfirm(); onClose() } }}
              disabled={!canConfirm}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                danger
                  ? 'bg-danger text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed'
                  : 'bg-accent-blue text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
