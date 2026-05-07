'use client'
import { useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export function Toast() {
  const { toast, hideToast } = useAppStore()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toast) hideToast()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [toast, hideToast])

  if (!toast) return null

  const icons = {
    success: <CheckCircle size={16} className="text-green-400 flex-shrink-0" />,
    error: <XCircle size={16} className="text-red-400 flex-shrink-0" />,
    info: <Info size={16} className="text-blue-400 flex-shrink-0" />,
  }

  const borderColors = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl',
        'bg-surface border shadow-xl',
        'animate-in slide-in-from-bottom-4 fade-in duration-200',
        borderColors[toast.type]
      )}
    >
      {icons[toast.type]}
      <span className="text-sm text-text-main font-medium">{toast.message}</span>
      <button
        onClick={hideToast}
        className="ml-1 text-text-muted hover:text-text-main transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}
