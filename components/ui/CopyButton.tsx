'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/lib/clipboard'
import { useAppStore } from '@/stores/useAppStore'

interface CopyButtonProps {
  text: string
  label?: string
  assetId?: string
  toastMessage?: string
  size?: 'sm' | 'md'
  variant?: 'icon' | 'button'
  className?: string
}

export function CopyButton({
  text,
  label,
  assetId,
  toastMessage,
  size = 'md',
  variant = 'button',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { showToast, incrementCopyCount } = useAppStore()

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!text) return
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      if (assetId) incrementCopyCount(assetId)
      showToast(toastMessage ?? (label ? `${label} copied` : 'Copied!'))
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const iconSize = size === 'sm' ? 12 : 14

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        aria-label={label ? `Copy ${label}` : 'Copy'}
        className={cn(
          'flex items-center justify-center rounded-lg transition-all',
          'text-text-muted hover:text-text-main hover:bg-surface-hover',
          size === 'sm' ? 'w-6 h-6' : 'w-7 h-7',
          copied && 'text-green-400 hover:text-green-400',
          className
        )}
      >
        {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
        'border border-border text-text-muted hover:text-text-main hover:border-border-soft hover:bg-surface-hover',
        copied && 'border-green-500/30 text-green-400 hover:text-green-400 bg-green-500/5',
        className
      )}
    >
      {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
      {copied ? 'Copied!' : (label ?? 'Copy')}
    </button>
  )
}
