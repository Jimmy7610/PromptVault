export type AssetType =
  | 'agent'
  | 'prompt'
  | 'image'
  | 'markdown'
  | 'code'
  | 'workflow'
  | 'template'
  | 'json'
  | 'link'
  | 'note'
  | 'other'

export type AssetStatus = 'active' | 'draft' | 'archived' | 'paused' | 'trash'

export type SortOption =
  | 'lastUsed'
  | 'newest'
  | 'mostCopied'
  | 'mostUsed'
  | 'alphabetical'
  | 'updated'

export type NavSection =
  | 'dashboard'
  | 'all'
  | 'agents'
  | 'prompts'
  | 'images'
  | 'markdown'
  | 'code'
  | 'workflows'
  | 'collections'
  | 'templates'
  | 'recent'
  | 'favorites'
  | 'trash'
  | 'settings'

export type ViewMode = 'grid' | 'list'

export type AccentColor = 'blue' | 'purple' | 'green' | 'orange'

export type ThemeMode = 'dark' | 'light' | 'system'

export interface Variable {
  name: string
  value: string
  description?: string
}

export interface LinkedFile {
  name: string
  type: 'md' | 'png' | 'jpg' | 'json' | 'pdf' | 'txt' | 'other'
  size?: string
}

export interface Asset {
  id: string
  type: AssetType
  title: string
  description: string
  content: string
  systemPrompt?: string
  instructions?: string
  negativePrompt?: string
  settings?: Record<string, string>
  tags: string[]
  tools: string[]
  linkedFiles?: LinkedFile[]
  notes?: string
  variables?: Variable[]
  exampleOutput?: string
  isFavorite: boolean
  status: AssetStatus
  visibility: 'private' | 'public' | 'team'
  version: string
  usageCount: number
  copyCount: number
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
  lastCopiedAt?: string
  language?: string
  imageUrl?: string
  imageColor?: string
  trashedAt?: string
}

export interface Collection {
  id: string
  name: string
  description: string
  icon: string
  color: string
  assetIds: string[]
  createdAt: string
  updatedAt: string
}

export interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

export interface StatsData {
  label: string
  value: number
  trend?: string
  trendUp?: boolean
  icon: string
  color: string
}

// ── User & Auth ──────────────────────────────────────────────────────────────
// Future Supabase: maps to `profiles` table joined with `auth.users`

export interface UserProfile {
  id: string
  name: string
  email: string
  workspaceName?: string
  avatarUrl?: string
  createdAt: string
}

// ── App Settings ─────────────────────────────────────────────────────────────
// Future Supabase: `user_settings` table keyed by user_id

export interface AppSettings {
  theme: ThemeMode
  accentColor: AccentColor
  defaultSortBy: SortOption
  defaultViewMode: ViewMode
  showUsageCount: boolean
  compactCards: boolean
}

// ── Team Invites ──────────────────────────────────────────────────────────────
// Future Supabase: `invites` table — email, role, token, accepted_at, created_by

export type InviteRole = 'viewer' | 'editor' | 'admin'

export interface PendingInvite {
  id: string
  email: string
  role: InviteRole
  message?: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

// ── Notifications ─────────────────────────────────────────────────────────────
// Local-first; future Supabase: realtime subscriptions / notifications table

export type NotificationType =
  | 'asset_created'
  | 'asset_trashed'
  | 'asset_restored'
  | 'asset_deleted'
  | 'export_completed'
  | 'invite_created'
  | 'profile_updated'
  | 'backup_reminder'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export type FilterVisibility = 'all' | 'private' | 'public' | 'team'

// ── Vault ─────────────────────────────────────────────────────────────────────

export type VaultStatus = 'not_initialized' | 'ready' | 'syncing' | 'error'

export interface VaultSettings {
  vaultEnabled: boolean
  vaultInitialized: boolean
  vaultLastSyncedAt: string | null
  vaultStatus: VaultStatus
}

export interface VaultIndexAsset {
  id: string
  type: AssetType
  category?: string
  title: string
  description: string
  path: string
  tags: string[]
  tools: string[]
  favorite: boolean
  version: string
  visibility: 'private' | 'public' | 'team'
  status: string
  createdAt: string
  updatedAt: string
  trashedAt: string | null
  usageCount: number
  copyCount: number
  language?: string
}

export interface VaultIndex {
  version: string
  updatedAt: string
  assets: VaultIndexAsset[]
}

// ── Ollama ────────────────────────────────────────────────────────────────────

export type OllamaStatus = 'idle' | 'checking' | 'connected' | 'error'

export interface OllamaModel {
  name: string
  size?: number
  modified_at?: string
  digest?: string
}

export interface OllamaSettings {
  enabled: boolean
  baseUrl: string
  autoSelect: boolean
  preferredModel: string
  models: OllamaModel[]
  lastCheckedAt: string | null
}
