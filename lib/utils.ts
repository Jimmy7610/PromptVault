import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AssetType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 5) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return date.toLocaleDateString()
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toString()
}

export const assetTypeConfig: Record<
  AssetType,
  { label: string; badgeClass: string; iconColor: string; bgColor: string }
> = {
  agent: {
    label: 'Agent',
    badgeClass: 'bg-violet-500/15 text-violet-300 border border-violet-500/25',
    iconColor: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  prompt: {
    label: 'Prompt',
    badgeClass: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  markdown: {
    label: 'Markdown',
    badgeClass: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25',
    iconColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  image: {
    label: 'Image',
    badgeClass: 'bg-green-500/15 text-green-300 border border-green-500/25',
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  code: {
    label: 'Code',
    badgeClass: 'bg-orange-500/15 text-orange-300 border border-orange-500/25',
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
  workflow: {
    label: 'Workflow',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  template: {
    label: 'Template',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25',
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
  },
  json: {
    label: 'JSON',
    badgeClass: 'bg-slate-500/15 text-slate-300 border border-slate-500/25',
    iconColor: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
  },
  link: {
    label: 'Link',
    badgeClass: 'bg-teal-500/15 text-teal-300 border border-teal-500/25',
    iconColor: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
  },
  note: {
    label: 'Note',
    badgeClass: 'bg-pink-500/15 text-pink-300 border border-pink-500/25',
    iconColor: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
  },
  other: {
    label: 'Other',
    badgeClass: 'bg-gray-500/15 text-gray-300 border border-gray-500/25',
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
  },
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
