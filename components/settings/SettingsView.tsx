'use client'
import { useState } from 'react'
import {
  User,
  Palette,
  Library,
  Download,
  Upload,
  Users,
  AlertTriangle,
  Check,
  Mail,
  Trash2,
  LogOut,
  Save,
  Cpu,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  HardDrive,
  FolderSync,
  FolderOpen,
  RotateCcw,
  CircleDot,
} from 'lucide-react'
import { useUserStore, getUserInitials } from '@/stores/useUserStore'
import { useAppStore } from '@/stores/useAppStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { AccentColor, Asset, InviteRole, PendingInvite, SortOption, ViewMode } from '@/types'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { downloadAllJSON, downloadAllMarkdown, parseImportJSON } from '@/lib/export'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { InviteTeamModal } from '@/components/team/InviteTeamModal'
import { testOllamaConnection, fetchOllamaModels } from '@/lib/ollama'
import { initVault, syncAssetsToVault, getVaultAssets, rebuildVaultIndex } from '@/lib/vaultClient'

const ACCENT_OPTIONS: { value: AccentColor; label: string; color: string }[] = [
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'purple', label: 'Purple', color: '#7c3aed' },
  { value: 'green', label: 'Green', color: '#22c55e' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lastUsed', label: 'Last Used' },
  { value: 'newest', label: 'Newest First' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'mostUsed', label: 'Most Used' },
  { value: 'mostCopied', label: 'Most Copied' },
]

type SettingsTab = 'profile' | 'appearance' | 'library' | 'export' | 'team' | 'ollama' | 'vault' | 'danger'

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'export', label: 'Export & Backup', icon: Download },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'ollama', label: 'Local AI', icon: Cpu },
  { id: 'vault', label: 'Vault Storage', icon: HardDrive },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'w-9 h-5 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-accent-blue' : 'bg-surface-soft border border-border'
      )}
    >
      <span
        className={cn(
          'block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform mx-0.5',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-3">
      {children}
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0 mr-4">
        <div className="text-sm text-text-main">{label}</div>
        {description && <div className="text-xs text-text-dim mt-0.5">{description}</div>}
      </div>
      {children}
    </div>
  )
}

export function SettingsView() {
  const { user, settings, invites, ollama, ollamaStatus, vault, updateProfile, setAccentColor, setDefaultSort, setDefaultViewMode, toggleShowUsageCount, toggleCompactCards, logout, clearAll: clearUserData, removeInvite, updateOllama, setOllamaStatus, setOllamaModels, updateVault, setVaultStatus } = useUserStore()
  const { assets, emptyTrash, clearAllAssets, showToast } = useAppStore()
  const { clearAll: clearNotifications } = useNotificationStore()

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    workspaceName: user?.workspaceName ?? '',
  })
  const [profileSaved, setProfileSaved] = useState(false)
  const [importError, setImportError] = useState('')
  const [clearDataConfirmOpen, setClearDataConfirmOpen] = useState(false)
  const [emptyTrashConfirmOpen, setEmptyTrashConfirmOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [ollamaUrlInput, setOllamaUrlInput] = useState(ollama.baseUrl)
  const [ollamaTestMessage, setOllamaTestMessage] = useState('')

  // Vault tab state
  const [vaultOpLoading, setVaultOpLoading] = useState(false)
  const [vaultOpMessage, setVaultOpMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [loadConfirmOpen, setLoadConfirmOpen] = useState(false)
  const [pendingLoadAssets, setPendingLoadAssets] = useState<Asset[]>([])

  const initials = user ? getUserInitials(user.name) : '?'
  const trashCount = assets.filter((a) => a.status === 'trash').length

  const handleSaveProfile = () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) return
    updateProfile({ name: profileForm.name, email: profileForm.email, workspaceName: profileForm.workspaceName })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
    showToast('Profile saved')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const result = parseImportJSON(ev.target?.result as string)
        if (result.assets.length === 0) { setImportError('No valid assets found in file.'); return }
        result.assets.forEach((a) => useAppStore.getState().addAsset(a))
        showToast(`Imported ${result.assets.length} assets`)
      } catch {
        setImportError('Invalid file format. Please use a PromptVault JSON export.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleTestOllama = async () => {
    setOllamaStatus('checking')
    setOllamaTestMessage('')
    try {
      const result = await testOllamaConnection(ollamaUrlInput)
      if (result.ok) {
        setOllamaStatus('connected')
        setOllamaTestMessage(`Connected · ${result.modelCount} model${result.modelCount !== 1 ? 's' : ''} available`)
        updateOllama({ baseUrl: ollamaUrlInput })
        // Fetch models immediately
        const models = await fetchOllamaModels(ollamaUrlInput)
        setOllamaModels(models)
        showToast('Ollama connected')
      } else {
        setOllamaStatus('error')
        setOllamaTestMessage(result.error ?? 'Connection failed')
      }
    } catch {
      setOllamaStatus('error')
      setOllamaTestMessage('Connection failed')
    }
  }

  const handleRefreshModels = async () => {
    setOllamaStatus('checking')
    try {
      const models = await fetchOllamaModels(ollama.baseUrl)
      setOllamaModels(models)
      setOllamaStatus('connected')
      showToast(`${models.length} models loaded`)
    } catch {
      setOllamaStatus('error')
    }
  }

  const vaultStatusLabel: Record<string, { label: string; color: string }> = {
    not_initialized: { label: 'Not initialized', color: 'text-text-dim' },
    ready:           { label: 'Ready',           color: 'text-green-400' },
    syncing:         { label: 'Syncing…',         color: 'text-accent-blue' },
    error:           { label: 'Error',            color: 'text-danger' },
  }

  const handleInitVault = async () => {
    setVaultOpLoading(true)
    setVaultOpMessage(null)
    setVaultStatus('syncing')
    const result = await initVault()
    if (result.ok) {
      updateVault({ vaultInitialized: true, vaultStatus: 'ready' })
      setVaultOpMessage({ ok: true, text: 'Vault initialized. Folder structure and index.json created.' })
      showToast('Vault initialized')
    } else {
      setVaultStatus('error')
      setVaultOpMessage({ ok: false, text: result.error ?? 'Failed to initialize vault.' })
    }
    setVaultOpLoading(false)
  }

  const handleSyncToVault = async () => {
    if (!vault.vaultInitialized) {
      setVaultOpMessage({ ok: false, text: 'Initialize vault first.' })
      return
    }
    setVaultOpLoading(true)
    setVaultOpMessage(null)
    setVaultStatus('syncing')
    const result = await syncAssetsToVault(assets as Asset[])
    if (result.ok) {
      updateVault({ vaultStatus: 'ready', vaultLastSyncedAt: new Date().toISOString() })
      setVaultOpMessage({ ok: true, text: `Synced ${result.saved} asset${result.saved !== 1 ? 's' : ''} to vault.` })
      showToast(`${result.saved} assets synced`)
    } else {
      setVaultStatus('error')
      const summary = result.errors.slice(0, 3).join('; ')
      setVaultOpMessage({ ok: false, text: `Synced ${result.saved} — ${result.errors.length} error(s): ${summary}` })
    }
    setVaultOpLoading(false)
  }

  const handleLoadFromVault = async () => {
    if (!vault.vaultInitialized) {
      setVaultOpMessage({ ok: false, text: 'Initialize vault first.' })
      return
    }
    setVaultOpLoading(true)
    setVaultOpMessage(null)
    try {
      const loaded = (await getVaultAssets(true)) as Asset[]
      if (loaded.length === 0) {
        setVaultOpMessage({ ok: false, text: 'No assets found in vault.' })
        setVaultOpLoading(false)
        return
      }
      setPendingLoadAssets(loaded)
      setLoadConfirmOpen(true)
    } catch (err) {
      setVaultOpMessage({ ok: false, text: err instanceof Error ? err.message : 'Failed to load from vault.' })
    }
    setVaultOpLoading(false)
  }

  const handleConfirmLoad = () => {
    // Merge vault assets into store by id (vault wins on conflict)
    const { assets: current } = useAppStore.getState()
    const merged = [...current]
    for (const vAsset of pendingLoadAssets) {
      if (!vAsset.id) continue
      const idx = merged.findIndex((a) => a.id === vAsset.id)
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...vAsset }
      } else {
        merged.push(vAsset)
      }
    }
    useAppStore.setState({ assets: merged })
    updateVault({ vaultLastSyncedAt: new Date().toISOString(), vaultStatus: 'ready' })
    setLoadConfirmOpen(false)
    setPendingLoadAssets([])
    setVaultOpMessage({ ok: true, text: `Loaded ${pendingLoadAssets.length} asset${pendingLoadAssets.length !== 1 ? 's' : ''} from vault.` })
    showToast(`${pendingLoadAssets.length} assets loaded from vault`)
  }

  const handleRebuildIndex = async () => {
    if (!vault.vaultInitialized) {
      setVaultOpMessage({ ok: false, text: 'Initialize vault first.' })
      return
    }
    setVaultOpLoading(true)
    setVaultOpMessage(null)
    const result = await rebuildVaultIndex()
    if (result.ok) {
      setVaultOpMessage({ ok: true, text: `Index rebuilt — ${result.count} asset${result.count !== 1 ? 's' : ''} found.` })
      showToast('Vault index rebuilt')
    } else {
      setVaultOpMessage({ ok: false, text: result.error ?? 'Rebuild failed.' })
    }
    setVaultOpLoading(false)
  }

  return (
    <div className="flex gap-0 h-full max-w-4xl mx-auto">
      {/* Sidebar tabs */}
      <div className="w-44 flex-shrink-0 pt-1 pr-4">
        <div className="text-xs font-semibold text-text-main mb-3">Settings</div>
        <nav className="space-y-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all',
                  activeTab === tab.id
                    ? 'bg-accent-blue/15 text-accent-blue font-medium'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-hover',
                  tab.id === 'danger' && activeTab !== 'danger' && 'hover:text-danger hover:bg-danger/10'
                )}
              >
                <Icon size={13} className="flex-shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 border-l border-border pl-6 pt-1">

        {/* Profile */}
        {activeTab === 'profile' && (
          <div>
            <SectionLabel>Profile</SectionLabel>
            <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-surface border border-border">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-white">{initials}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-text-main">{user?.name}</div>
                <div className="text-xs text-text-muted">{user?.email}</div>
                <div className="text-[10px] text-text-dim mt-0.5">
                  Member since {user?.createdAt ? formatDate(user.createdAt) : '—'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Workspace Name <span className="text-text-dim font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={profileForm.workspaceName}
                  onChange={(e) => setProfileForm({ ...profileForm, workspaceName: e.target.value })}
                  placeholder="My AI Studio"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                {profileSaved ? <Check size={14} /> : <Save size={14} />}
                {profileSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Appearance */}
        {activeTab === 'appearance' && (
          <div>
            <SectionLabel>Appearance</SectionLabel>
            <div className="mb-5">
              <div className="text-xs font-medium text-text-muted mb-3">Accent Color</div>
              <div className="flex gap-3">
                {ACCENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAccentColor(opt.value)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center',
                        settings.accentColor === opt.value
                          ? 'border-white/60 scale-110 shadow-lg'
                          : 'border-transparent hover:border-white/30'
                      )}
                      style={{ backgroundColor: opt.color }}
                    >
                      {settings.accentColor === opt.value && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                    <span className="text-[10px] text-text-dim">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/15">
              <div className="text-xs text-text-muted">
                The accent color changes the highlight color throughout the entire app. Changes apply instantly.
              </div>
            </div>
          </div>
        )}

        {/* Library */}
        {activeTab === 'library' && (
          <div>
            <SectionLabel>Library Preferences</SectionLabel>
            <div className="rounded-xl border border-border overflow-hidden">
              <SettingRow label="Default Sort" description="How assets are sorted when you open a section">
                <select
                  value={settings.defaultSortBy}
                  onChange={(e) => setDefaultSort(e.target.value as SortOption)}
                  className="text-xs rounded-lg bg-background border border-border text-text-main px-2 py-1.5 focus:outline-none focus:border-accent-blue/50"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </SettingRow>
              <SettingRow label="Default View Mode" description="Grid or list layout for asset cards">
                <div className="flex gap-1">
                  {(['grid', 'list'] as ViewMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setDefaultViewMode(m)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs capitalize transition-all',
                        settings.defaultViewMode === m
                          ? 'bg-accent-blue/20 text-accent-blue'
                          : 'text-text-dim hover:text-text-muted border border-border'
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Show Usage Count" description="Display usage stats on asset cards">
                <Toggle checked={settings.showUsageCount} onChange={toggleShowUsageCount} />
              </SettingRow>
              <SettingRow label="Compact Cards" description="Reduce card padding for denser layouts">
                <Toggle checked={settings.compactCards} onChange={toggleCompactCards} />
              </SettingRow>
            </div>
          </div>
        )}

        {/* Export & Backup */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <SectionLabel>Export</SectionLabel>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    downloadAllJSON(assets)
                    useNotificationStore.getState().addNotification({
                      type: 'export_completed',
                      title: 'Export complete',
                      message: `${assets.length} assets exported as JSON.`,
                    })
                    showToast('Exported as JSON')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-soft hover:bg-surface-hover text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                    <Download size={14} className="text-accent-blue" />
                  </div>
                  <div>
                    <div className="text-sm text-text-main">Export all assets as JSON</div>
                    <div className="text-xs text-text-dim mt-0.5">Full data backup including all metadata · {assets.length} assets</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    downloadAllMarkdown(assets)
                    useNotificationStore.getState().addNotification({
                      type: 'export_completed',
                      title: 'Export complete',
                      message: `${assets.length} assets exported as Markdown.`,
                    })
                    showToast('Exported as Markdown')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-soft hover:bg-surface-hover text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                    <Download size={14} className="text-accent-blue" />
                  </div>
                  <div>
                    <div className="text-sm text-text-main">Export all assets as Markdown</div>
                    <div className="text-xs text-text-dim mt-0.5">Human-readable format for documentation</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <SectionLabel>Import</SectionLabel>
              <label className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-soft hover:bg-surface-hover cursor-pointer transition-all">
                <div className="w-8 h-8 rounded-lg bg-surface-soft flex items-center justify-center flex-shrink-0">
                  <Upload size={14} className="text-text-muted" />
                </div>
                <div>
                  <div className="text-sm text-text-main">Import from JSON</div>
                  <div className="text-xs text-text-dim mt-0.5">Restore assets from a PromptVault backup file</div>
                </div>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              {importError && (
                <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 mt-2">{importError}</p>
              )}
            </div>
          </div>
        )}

        {/* Team */}
        {activeTab === 'team' && (
          <div>
            <SectionLabel>Team & Invites</SectionLabel>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-text-muted">
                Invites are stored locally. Email sending available when Supabase is connected.
              </p>
              <button
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue text-white text-xs font-medium hover:bg-blue-500 transition-colors flex-shrink-0 ml-3"
              >
                <Users size={12} /> Invite
              </button>
            </div>

            {invites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-border rounded-xl">
                <Users size={28} className="text-text-dim mb-2" />
                <div className="text-sm text-text-muted">No pending invites</div>
                <div className="text-xs text-text-dim mt-1">Invite team members to collaborate</div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {invites.map((invite: PendingInvite) => (
                  <div key={invite.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface border border-border">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-surface-soft border border-border flex items-center justify-center flex-shrink-0">
                        <Mail size={12} className="text-text-dim" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-text-main truncate">{invite.email}</div>
                        <div className="text-xs text-text-dim capitalize">
                          {invite.role} · {formatDate(invite.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-soft border border-border text-text-dim">
                        Pending
                      </span>
                      <button
                        onClick={() => removeInvite(invite.id)}
                        className="text-text-dim hover:text-danger transition-colors"
                        aria-label="Remove invite"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Local AI / Ollama */}
        {activeTab === 'ollama' && (
          <div className="space-y-5">
            <SectionLabel>Local AI — Ollama</SectionLabel>

            {/* Enable toggle */}
            <div className="rounded-xl border border-border overflow-hidden">
              <SettingRow label="Enable Ollama" description="Run agents locally using your Ollama instance">
                <Toggle
                  checked={ollama.enabled}
                  onChange={() => updateOllama({ enabled: !ollama.enabled })}
                />
              </SettingRow>
            </div>

            {ollama.enabled && (
              <>
                {/* URL + test */}
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Base URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ollamaUrlInput}
                      onChange={(e) => setOllamaUrlInput(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                    />
                    <button
                      onClick={handleTestOllama}
                      disabled={ollamaStatus === 'checking'}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-soft border border-border text-xs text-text-muted hover:text-text-main transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {ollamaStatus === 'checking'
                        ? <Loader2 size={12} className="animate-spin" />
                        : ollamaStatus === 'connected'
                        ? <CheckCircle2 size={12} className="text-green-400" />
                        : ollamaStatus === 'error'
                        ? <XCircle size={12} className="text-danger" />
                        : null}
                      Test Connection
                    </button>
                  </div>
                  {ollamaTestMessage && (
                    <p className={cn(
                      'text-[11px] mt-1.5',
                      ollamaStatus === 'connected' ? 'text-green-400' : 'text-danger'
                    )}>
                      {ollamaTestMessage}
                    </p>
                  )}
                </div>

                {/* Model list */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-text-muted">Available Models</div>
                    <button
                      onClick={handleRefreshModels}
                      disabled={ollamaStatus === 'checking'}
                      className="flex items-center gap-1 text-[11px] text-text-dim hover:text-text-muted transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={11} className={ollamaStatus === 'checking' ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>

                  {ollama.models.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 border border-border rounded-xl text-center">
                      <Cpu size={22} className="text-text-dim mb-2" />
                      <div className="text-xs text-text-muted">No models found</div>
                      <div className="text-[11px] text-text-dim mt-1">Test connection to load available models</div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {ollama.models.map((model) => (
                        <div
                          key={model.name}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-lg border transition-colors cursor-pointer',
                            ollama.preferredModel === model.name && !ollama.autoSelect
                              ? 'border-accent-blue/30 bg-accent-blue/5'
                              : 'border-border hover:border-border-soft bg-background'
                          )}
                          onClick={() => !ollama.autoSelect && updateOllama({ preferredModel: model.name })}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                            <span className="text-xs text-text-main font-mono">{model.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {model.size && (
                              <span className="text-[10px] text-text-dim">
                                {(model.size / 1e9).toFixed(1)}GB
                              </span>
                            )}
                            {ollama.preferredModel === model.name && !ollama.autoSelect && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-blue/15 text-accent-blue font-medium">preferred</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {ollama.lastCheckedAt && (
                    <p className="text-[10px] text-text-dim mt-1.5">
                      Last checked {formatRelativeTime(ollama.lastCheckedAt)}
                    </p>
                  )}
                </div>

                {/* Auto-select toggle */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <SettingRow
                    label="Auto-select model"
                    description="Pick the best model for each task type (coding, writing, reasoning)"
                  >
                    <Toggle
                      checked={ollama.autoSelect}
                      onChange={() => updateOllama({ autoSelect: !ollama.autoSelect })}
                    />
                  </SettingRow>
                </div>

                {!ollama.autoSelect && ollama.models.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Preferred Model</label>
                    <select
                      value={ollama.preferredModel || ollama.models[0]?.name || ''}
                      onChange={(e) => updateOllama({ preferredModel: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main focus:outline-none focus:border-accent-blue/50"
                    >
                      {ollama.models.map((m) => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-surface-soft border border-border">
                  <p className="text-[11px] text-text-dim leading-relaxed">
                    Ollama runs locally on your machine. No data is sent to external servers.
                    Make sure Ollama is running before testing. Models are pulled via <code className="text-text-muted">ollama pull &lt;model&gt;</code>.
                  </p>
                </div>
              </>
            )}

            {!ollama.enabled && (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-border rounded-xl">
                <Cpu size={32} className="text-text-dim mb-3" />
                <div className="text-sm text-text-muted font-medium mb-1">Enable Local AI</div>
                <div className="text-xs text-text-dim max-w-xs">
                  Toggle on to connect Ollama and run agents locally with no internet required.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vault Storage */}
        {activeTab === 'vault' && (
          <div className="space-y-5">
            <SectionLabel>Local Vault File Storage</SectionLabel>

            {/* Enable toggle + status */}
            <div className="rounded-xl border border-border overflow-hidden">
              <SettingRow
                label="Use Local Vault Storage"
                description="Save assets as real files inside the project's vault/ folder"
              >
                <Toggle
                  checked={vault.vaultEnabled}
                  onChange={() => updateVault({ vaultEnabled: !vault.vaultEnabled })}
                />
              </SettingRow>
            </div>

            {/* Status + path */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-soft border border-border">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-text-muted">Vault Path</div>
                <div className="text-[11px] font-mono text-text-dim">project-root/vault</div>
              </div>
              <div className="flex items-center gap-1.5">
                <CircleDot
                  size={10}
                  className={vaultStatusLabel[vault.vaultStatus]?.color ?? 'text-text-dim'}
                />
                <span className={cn('text-[11px] font-medium', vaultStatusLabel[vault.vaultStatus]?.color ?? 'text-text-dim')}>
                  {vaultStatusLabel[vault.vaultStatus]?.label ?? vault.vaultStatus}
                </span>
              </div>
            </div>

            {/* Operation result banner */}
            {vaultOpMessage && (
              <div className={cn(
                'px-4 py-3 rounded-xl border text-xs',
                vaultOpMessage.ok
                  ? 'bg-green-500/5 border-green-500/20 text-green-400'
                  : 'bg-danger/5 border-danger/20 text-danger'
              )}>
                {vaultOpMessage.ok ? <Check size={12} className="inline mr-1.5" /> : null}
                {vaultOpMessage.text}
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {/* Initialize */}
              <button
                onClick={handleInitVault}
                disabled={vaultOpLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-soft hover:bg-surface-hover text-left transition-all disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                  {vaultOpLoading && vault.vaultStatus === 'syncing' && !vault.vaultInitialized
                    ? <Loader2 size={14} className="text-accent-blue animate-spin" />
                    : <HardDrive size={14} className="text-accent-blue" />}
                </div>
                <div>
                  <div className="text-sm text-text-main">Initialize Vault</div>
                  <div className="text-xs text-text-dim mt-0.5">Create folder structure and index.json</div>
                </div>
              </button>

              {/* Sync to vault */}
              <button
                onClick={handleSyncToVault}
                disabled={vaultOpLoading || !vault.vaultInitialized}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-soft hover:bg-surface-hover text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  {vaultOpLoading && vault.vaultStatus === 'syncing'
                    ? <Loader2 size={14} className="text-violet-400 animate-spin" />
                    : <FolderSync size={14} className="text-violet-400" />}
                </div>
                <div>
                  <div className="text-sm text-text-main">Sync Current Assets to Vault</div>
                  <div className="text-xs text-text-dim mt-0.5">
                    Write {assets.length} asset{assets.length !== 1 ? 's' : ''} as files · one file per asset
                    {vault.vaultLastSyncedAt && (
                      <> · last synced {formatRelativeTime(vault.vaultLastSyncedAt)}</>
                    )}
                  </div>
                </div>
              </button>

              {/* Load from vault */}
              <button
                onClick={handleLoadFromVault}
                disabled={vaultOpLoading || !vault.vaultInitialized}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-soft hover:bg-surface-hover text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  {vaultOpLoading
                    ? <Loader2 size={14} className="text-green-400 animate-spin" />
                    : <FolderOpen size={14} className="text-green-400" />}
                </div>
                <div>
                  <div className="text-sm text-text-main">Load Assets from Vault</div>
                  <div className="text-xs text-text-dim mt-0.5">Read vault files and merge into library (vault wins on conflict)</div>
                </div>
              </button>

              {/* Rebuild index */}
              <button
                onClick={handleRebuildIndex}
                disabled={vaultOpLoading || !vault.vaultInitialized}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-soft hover:bg-surface-hover text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <RotateCcw size={14} className="text-orange-400" />
                </div>
                <div>
                  <div className="text-sm text-text-main">Rebuild Vault Index</div>
                  <div className="text-xs text-text-dim mt-0.5">Scan vault folders and regenerate index.json (use after manual file edits)</div>
                </div>
              </button>
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-xl bg-surface-soft border border-border space-y-2">
              <div className="text-xs font-medium text-text-muted">About Vault Storage</div>
              <p className="text-[11px] text-text-dim leading-relaxed">
                Each asset is stored as a single file inside <code className="text-text-muted">project-root/vault/</code>.
                Prompts, agents, and templates use Markdown with YAML frontmatter.
                Workflows and JSON configs use <code className="text-text-muted">.json</code>.
                The <code className="text-text-muted">index.json</code> file is the fast lookup map — full content lives in each asset file.
                Nothing is uploaded. All data stays local.
              </p>
              <p className="text-[11px] text-text-dim leading-relaxed">
                <span className="text-yellow-400 font-medium">Note:</span> Permanent delete moves files to{' '}
                <code className="text-text-muted">vault/.deleted/</code> — files are never hard-deleted automatically.
              </p>
              <p className="text-[11px] text-text-dim leading-relaxed">
                <span className="text-yellow-400 font-medium">Warning:</span> Do not rename vault files while the app is open
                unless you click Rebuild Vault Index afterwards.
              </p>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === 'danger' && (
          <div>
            <SectionLabel>Danger Zone</SectionLabel>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border">
                <div>
                  <div className="text-sm text-text-main">Empty Trash</div>
                  <div className="text-xs text-text-dim mt-0.5">{trashCount} item{trashCount !== 1 ? 's' : ''} in trash</div>
                </div>
                <button
                  onClick={() => setEmptyTrashConfirmOpen(true)}
                  disabled={trashCount === 0}
                  className="px-3 py-1.5 rounded-lg text-xs text-danger border border-danger/30 hover:bg-danger/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Empty Trash
                </button>
              </div>

              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-danger/25 bg-danger/5">
                <div>
                  <div className="text-sm text-text-main">Clear All Data</div>
                  <div className="text-xs text-text-dim mt-0.5">Permanently delete all {assets.length} assets</div>
                </div>
                <button
                  onClick={() => setClearDataConfirmOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30 transition-colors"
                >
                  Clear Data
                </button>
              </div>

              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border">
                <div>
                  <div className="text-sm text-text-main">Log Out</div>
                  <div className="text-xs text-text-dim mt-0.5">Sign out and return to the login screen</div>
                </div>
                <button
                  onClick={() => setLogoutConfirmOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted border border-border hover:text-danger hover:border-danger/30 transition-colors"
                >
                  <LogOut size={12} /> Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        open={emptyTrashConfirmOpen}
        onClose={() => setEmptyTrashConfirmOpen(false)}
        onConfirm={emptyTrash}
        title="Empty trash?"
        message={`Permanently delete all ${trashCount} item${trashCount !== 1 ? 's' : ''} in the trash. This cannot be undone.`}
        confirmLabel="Empty Trash"
        requireWord="DELETE"
      />
      <ConfirmModal
        open={clearDataConfirmOpen}
        onClose={() => setClearDataConfirmOpen(false)}
        onConfirm={() => {
          clearAllAssets()
          clearUserData()
          clearNotifications()
        }}
        title="Clear all data?"
        message={`This will permanently delete all ${assets.length} assets and reset your profile. This cannot be undone.`}
        confirmLabel="Clear All"
        requireWord="DELETE"
      />
      <ConfirmModal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={logout}
        title="Log out?"
        message="You'll return to the login screen. Your data will remain saved locally in this browser."
        confirmLabel="Log Out"
        danger={false}
      />
      <InviteTeamModal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} />

      {/* Load from Vault confirmation */}
      <ConfirmModal
        open={loadConfirmOpen}
        onClose={() => { setLoadConfirmOpen(false); setPendingLoadAssets([]) }}
        onConfirm={handleConfirmLoad}
        title="Load assets from Vault?"
        message={`This will merge ${pendingLoadAssets.length} asset${pendingLoadAssets.length !== 1 ? 's' : ''} from the vault into your library. For any conflicting IDs, the vault version will overwrite the current one. Your existing assets that are not in the vault will be kept.`}
        confirmLabel="Load from Vault"
        danger={false}
      />
    </div>
  )
}
