'use client'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useCopyStore } from '@/stores/useCopyStore'
import { AssetType } from '@/types'

interface StatsCardProps {
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  icon: React.ReactNode
  iconBg: string
}

export function StatsCard({ label, value, trend, trendUp, icon, iconBg }: StatsCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border hover:border-border-soft transition-all">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-text-muted mb-0.5 truncate">{label}</div>
        <div className="text-xl font-bold text-text-main leading-none mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-[11px] font-medium',
              trendUp !== false ? 'text-accent-green' : 'text-danger'
            )}
          >
            {trendUp !== false ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </div>
        )}
      </div>
    </div>
  )
}

// Asset types counted under "Files"
const FILE_LIKE_TYPES: AssetType[] = ['markdown', 'code', 'workflow', 'image', 'json', 'note', 'link', 'other']

function isSameLocalDay(iso: string): boolean {
  const d = new Date(iso)
  const t = new Date()
  return d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
}

export function StatsRow() {
  const assets = useAppStore((s) => s.assets)
  const copiedToday = useCopyStore((s) =>
    s.copyEvents.filter((e) => isSameLocalDay(e.copiedAt)).length
  )

  const active = assets.filter((a) => a.status !== 'trash')
  const total     = active.length
  const agents    = active.filter((a) => a.type === 'agent').length
  const prompts   = active.filter((a) => a.type === 'prompt').length
  const files     = active.filter((a) => FILE_LIKE_TYPES.includes(a.type as AssetType)).length
  const templates = active.filter((a) => a.type === 'template').length

  const stats = [
    {
      label: 'Total Assets',
      value: total,
      trend: 'active assets',
      trendUp: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-400">
          <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.7" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.7" />
        </svg>
      ),
      iconBg: 'bg-blue-500/15',
    },
    {
      label: 'Agents',
      value: agents,
      trend: 'saved agents',
      trendUp: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-violet-400">
          <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-violet-500/15',
    },
    {
      label: 'Prompts',
      value: prompts,
      trend: 'saved prompts',
      trendUp: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-400">
          <path d="M2 3h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 13l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      iconBg: 'bg-blue-500/15',
    },
    {
      label: 'Files',
      value: files,
      trend: 'file-like assets',
      trendUp: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-yellow-400">
          <path d="M9 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      iconBg: 'bg-yellow-500/15',
    },
    {
      label: 'Copied Today',
      value: copiedToday,
      trend: 'copy actions today',
      trendUp: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-green-400">
          <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 11V3a1 1 0 011-1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-green-500/15',
    },
    {
      label: 'Templates',
      value: templates,
      trend: 'saved templates',
      trendUp: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-indigo-400">
          <rect x="1" y="1" width="14" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1" y="8" width="6" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="8" width="6" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      iconBg: 'bg-indigo-500/15',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {stats.map((stat) => (
        <StatsCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
