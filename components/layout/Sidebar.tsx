'use client'
import { useState } from 'react'
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Image,
  FileText,
  Code2,
  GitBranch,
  FolderOpen,
  Layout,
  Clock,
  Star,
  Trash2,
  Settings,
  Layers,
  Plus,
  ClipboardPaste,
  ChevronDown,
  LogOut,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useUserStore, getUserInitials } from '@/stores/useUserStore'
import { useCollectionStore } from '@/stores/useCollectionStore'
import { useAssetCounts } from '@/hooks/useFilteredAssets'
import { useI18n } from '@/lib/i18n/useI18n'
import { NavSection } from '@/types'
import { InviteTeamModal } from '@/components/team/InviteTeamModal'

interface NavItem {
  id: NavSection
  label: string
  icon: React.ElementType
  count?: number
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

function VaultIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="2" stroke="white" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2" stroke="white" strokeWidth="1.5" />
        <line x1="8" y1="6" x2="8" y2="3" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export function Sidebar() {
  const { activeSection, setActiveSection, openNewAssetModal, openClipboardModal } = useAppStore()
  const { user, logout } = useUserStore()
  const counts = useAssetCounts()
  const collectionCount = useCollectionStore((s) => s.collections.length)
  const { t } = useI18n()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const initials = user ? getUserInitials(user.name) : '?'
  const displayName = user?.name ?? 'PromptVault User'
  const displayEmail = user?.email ?? ''

  const navGroups: NavGroup[] = [
    {
      items: [{ id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard }],
    },
    {
      label: t('sidebar.library'),
      items: [
        { id: 'all',       label: t('nav.allAssets'),    icon: Layers,       count: counts.all },
        { id: 'agents',    label: t('nav.agents'),       icon: Bot,          count: counts.agents },
        { id: 'prompts',   label: t('nav.prompts'),      icon: MessageSquare,count: counts.prompts },
        { id: 'images',    label: t('nav.images'),       icon: Image,        count: counts.images },
        { id: 'markdown',  label: t('nav.markdownFiles'),icon: FileText,     count: counts.markdown },
        { id: 'code',      label: t('nav.codeSnippets'), icon: Code2,        count: counts.code },
        { id: 'workflows', label: t('nav.workflows'),    icon: GitBranch,    count: counts.workflows },
      ],
    },
    {
      label: t('sidebar.organize'),
      items: [
        { id: 'collections', label: t('nav.collections'), icon: FolderOpen, count: collectionCount || undefined },
        { id: 'templates',   label: t('nav.templates'),   icon: Layout, count: counts.templates },
      ],
    },
    {
      items: [
        { id: 'recent',    label: t('nav.recent'),    icon: Clock },
        { id: 'favorites', label: t('nav.favorites'), icon: Star,   count: counts.favorites },
        { id: 'trash',     label: t('nav.trash'),     icon: Trash2, count: counts.trash || undefined },
      ],
    },
    {
      label: t('sidebar.system'),
      items: [{ id: 'settings', label: t('nav.settings'), icon: Settings }],
    },
  ]

  return (
    <>
      <aside className="w-60 flex-shrink-0 flex flex-col bg-surface border-r border-border h-screen overflow-y-auto">
        {/* Logo */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2.5 mb-1">
            <VaultIcon />
            <div>
              <div className="text-sm font-bold text-text-main leading-none">PromptVault</div>
              <div className="text-[10px] text-text-muted leading-tight mt-0.5">
                {user?.workspaceName ?? 'Universal AI Workspace'}
              </div>
            </div>
          </div>
        </div>

        {/* New Asset + From Clipboard */}
        <div className="px-3 mb-4 space-y-1.5">
          <button
            onClick={() => openNewAssetModal()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent-blue hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            {t('sidebar.newAsset')}
          </button>
          <button
            onClick={() => openClipboardModal()}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-text-main hover:border-accent-blue/40 hover:bg-surface-hover text-xs transition-all"
          >
            <ClipboardPaste size={12} />
            {t('sidebar.fromClipboard')}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'pt-3' : ''}>
              {group.label && (
                <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider text-text-dim uppercase">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all group',
                      isActive
                        ? 'bg-accent-blue/15 text-accent-blue font-medium'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
                    )}
                  >
                    <Icon
                      size={15}
                      className={cn(
                        'flex-shrink-0',
                        isActive ? 'text-accent-blue' : 'text-text-dim group-hover:text-text-muted'
                      )}
                    />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                          isActive
                            ? 'bg-accent-blue/20 text-accent-blue'
                            : 'bg-surface-soft text-text-dim'
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="px-3 py-4 border-t border-border mt-2">
          {/* Profile card with dropdown */}
          <div className="relative mb-3">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-full flex items-center gap-2.5 hover:bg-surface-hover rounded-lg p-1.5 -mx-1.5 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-white">{initials}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium text-text-main truncate">{displayName}</div>
                <div className="text-[10px] text-text-muted truncate">{displayEmail}</div>
              </div>
              <ChevronDown
                size={12}
                className={cn(
                  'text-text-dim flex-shrink-0 transition-transform',
                  profileMenuOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Profile dropdown */}
            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                <div className="absolute bottom-full left-0 right-0 mb-1 z-20 rounded-xl bg-surface border border-border shadow-xl py-1">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false)
                      setActiveSection('settings')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                  >
                    <User size={12} /> {t('sidebar.editProfile')}
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false)
                      setActiveSection('settings')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
                  >
                    <Settings size={12} /> {t('nav.settings')}
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => { setProfileMenuOpen(false); logout() }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors"
                  >
                    <LogOut size={12} /> {t('sidebar.logOut')}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Storage bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-text-muted">{t('sidebar.localStorage')}</span>
              <span className="text-[10px] text-text-dim">Browser</span>
            </div>
            <div className="h-1 bg-surface-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-blue to-accent-violet rounded-full"
                style={{ width: '24%' }}
              />
            </div>
          </div>

          <button
            onClick={() => setInviteModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 text-[11px] text-text-muted hover:text-text-main border border-border hover:border-border-soft rounded-lg py-1.5 transition-all"
          >
            <Users size={11} />
            {t('sidebar.inviteTeam')}
          </button>
        </div>
      </aside>

      <InviteTeamModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />
    </>
  )
}
