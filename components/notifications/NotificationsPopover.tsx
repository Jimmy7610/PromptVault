'use client'
import { useEffect } from 'react'
import {
  X,
  Bell,
  BellOff,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Mail,
  User,
  Save,
  CheckCheck,
} from 'lucide-react'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { AppNotification, NotificationType } from '@/types'
import { cn, formatRelativeTime } from '@/lib/utils'

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  asset_created:   { icon: Plus,      color: 'text-accent-blue',   bg: 'bg-accent-blue/10' },
  asset_trashed:   { icon: Trash2,    color: 'text-text-dim',      bg: 'bg-surface-soft' },
  asset_restored:  { icon: RotateCcw, color: 'text-accent-blue',   bg: 'bg-accent-blue/10' },
  asset_deleted:   { icon: Trash2,    color: 'text-danger',        bg: 'bg-danger/10' },
  export_completed:{ icon: Download,  color: 'text-accent-blue',   bg: 'bg-accent-blue/10' },
  invite_created:  { icon: Mail,      color: 'text-violet-400',    bg: 'bg-violet-500/10' },
  profile_updated: { icon: User,      color: 'text-text-muted',    bg: 'bg-surface-soft' },
  backup_reminder: { icon: Save,      color: 'text-yellow-400',    bg: 'bg-yellow-500/10' },
}

interface NotificationsPopoverProps {
  onClose: () => void
}

function NotificationItem({ notification }: { notification: AppNotification }) {
  const { markRead } = useNotificationStore()
  const config = TYPE_CONFIG[notification.type]
  const Icon = config.icon

  return (
    <button
      onClick={() => markRead(notification.id)}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
        notification.read
          ? 'hover:bg-surface-hover'
          : 'bg-accent-blue/5 hover:bg-accent-blue/8'
      )}
    >
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', config.bg)}>
        <Icon size={13} className={config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={cn('text-xs font-medium', notification.read ? 'text-text-muted' : 'text-text-main')}>
            {notification.title}
          </span>
          {!notification.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-[11px] text-text-dim mt-0.5 leading-relaxed">{notification.message}</p>
        <span className="text-[10px] text-text-dim mt-1 block">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>
    </button>
  )
}

export function NotificationsPopover({ onClose }: NotificationsPopoverProps) {
  const { notifications, markAllRead, clearAll } = useNotificationStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      {/* Click-outside overlay */}
      <div className="fixed inset-0 z-20" onClick={onClose} />

      <div className="absolute right-0 top-full mt-2 z-30 w-80 rounded-xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-150 origin-top-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-main">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-accent-blue text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                title="Mark all as read"
                className="p-1.5 rounded text-text-dim hover:text-text-muted hover:bg-surface-hover transition-colors"
              >
                <CheckCheck size={13} />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                title="Clear all notifications"
                className="p-1.5 rounded text-text-dim hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded text-text-dim hover:text-text-muted hover:bg-surface-hover transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-surface-soft flex items-center justify-center mb-3">
                <BellOff size={18} className="text-text-dim" />
              </div>
              <div className="text-sm text-text-muted">No notifications yet</div>
              <div className="text-xs text-text-dim mt-1">
                Activity like asset creation, exports, and invites will appear here.
              </div>
            </div>
          ) : (
            notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
          )}
        </div>

        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-border">
            <p className="text-[10px] text-text-dim text-center">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''} · stored locally
            </p>
          </div>
        )}
      </div>
    </>
  )
}
