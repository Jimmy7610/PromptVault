'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { UserProfile, AppSettings, PendingInvite, InviteRole, AccentColor, SortOption, ViewMode, OllamaSettings, OllamaStatus, OllamaModel, VaultSettings, VaultStatus, AppLanguage } from '@/types'
import { generateId } from '@/lib/utils'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'blue',
  defaultSortBy: 'lastUsed',
  defaultViewMode: 'grid',
  showUsageCount: true,
  compactCards: false,
  language: 'en',
}

const DEFAULT_VAULT: VaultSettings = {
  vaultEnabled: false,
  vaultInitialized: false,
  vaultLastSyncedAt: null,
  vaultStatus: 'not_initialized',
  lastVaultBackupAt: null,
}

const DEFAULT_OLLAMA: OllamaSettings = {
  enabled: false,
  baseUrl: 'http://localhost:11434',
  autoSelect: true,
  preferredModel: '',
  models: [],
  lastCheckedAt: null,
}

interface UserState {
  user: UserProfile | null     // profile (kept on logout)
  isLoggedIn: boolean          // session flag (cleared on logout)
  _hasHydrated: boolean        // internal — true once localStorage is read

  settings: AppSettings
  invites: PendingInvite[]

  // Vault — all persisted
  vault: VaultSettings

  // Ollama — settings persisted; status is runtime-only
  ollama: OllamaSettings
  ollamaStatus: OllamaStatus

  // Hydration
  setHasHydrated: () => void

  // Auth
  login: (data: { name: string; email: string; workspaceName?: string }) => void
  resumeSession: () => void    // returning user: keep profile, just set isLoggedIn=true
  logout: () => void           // keeps profile; sets isLoggedIn=false
  clearAll: () => void         // full reset (danger zone)

  // Profile
  updateProfile: (updates: Partial<Pick<UserProfile, 'name' | 'email' | 'workspaceName'>>) => void

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void
  setAccentColor: (color: AccentColor) => void
  setDefaultSort: (sort: SortOption) => void
  setDefaultViewMode: (mode: ViewMode) => void
  toggleShowUsageCount: () => void
  toggleCompactCards: () => void
  setLanguage: (lang: AppLanguage) => void

  // Invites
  addInvite: (data: { email: string; role: InviteRole; message?: string }) => void
  removeInvite: (id: string) => void

  // Ollama
  updateOllama: (updates: Partial<OllamaSettings>) => void
  setOllamaStatus: (status: OllamaStatus) => void
  setOllamaModels: (models: OllamaModel[]) => void

  // Vault
  updateVault: (updates: Partial<VaultSettings>) => void
  setVaultStatus: (status: VaultStatus) => void
}

const safeLocalStorage = () => {
  if (typeof window !== 'undefined') return localStorage
  return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      _hasHydrated: false,
      settings: DEFAULT_SETTINGS,
      invites: [],
      vault: DEFAULT_VAULT,
      ollama: DEFAULT_OLLAMA,
      ollamaStatus: 'idle',

      setHasHydrated: () => set({ _hasHydrated: true }),

      login: (data) => {
        const existing = get().user
        // Re-use existing profile if same email, otherwise create new
        const sameEmail = existing && data.email.trim().toLowerCase() === existing.email
        const user: UserProfile = sameEmail
          ? {
              ...existing!,
              name: data.name.trim() || existing!.name,
              workspaceName: data.workspaceName?.trim() || existing!.workspaceName,
            }
          : {
              id: generateId(),
              name: data.name.trim(),
              email: data.email.trim().toLowerCase(),
              workspaceName: data.workspaceName?.trim() || undefined,
              createdAt: new Date().toISOString(),
            }
        set({ user, isLoggedIn: true })
      },

      resumeSession: () => set({ isLoggedIn: true }),

      logout: () => set({ isLoggedIn: false }),

      clearAll: () =>
        set({
          user: null,
          isLoggedIn: false,
          settings: DEFAULT_SETTINGS,
          invites: [],
          vault: DEFAULT_VAULT,
          ollama: DEFAULT_OLLAMA,
          ollamaStatus: 'idle',
        }),

      updateProfile: (updates) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                name: updates.name?.trim() ?? state.user.name,
                email: updates.email?.trim().toLowerCase() ?? state.user.email,
                workspaceName: updates.workspaceName?.trim() || state.user.workspaceName,
              }
            : null,
        }))
        import('@/stores/useNotificationStore').then(({ useNotificationStore }) => {
          useNotificationStore.getState().addNotification({
            type: 'profile_updated',
            title: 'Profile updated',
            message: 'Your profile changes were saved.',
          })
        })
      },

      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),

      setAccentColor: (color) =>
        set((state) => ({ settings: { ...state.settings, accentColor: color } })),

      setDefaultSort: (sort) =>
        set((state) => ({ settings: { ...state.settings, defaultSortBy: sort } })),

      setDefaultViewMode: (mode) =>
        set((state) => ({ settings: { ...state.settings, defaultViewMode: mode } })),

      toggleShowUsageCount: () =>
        set((state) => ({
          settings: { ...state.settings, showUsageCount: !state.settings.showUsageCount },
        })),

      toggleCompactCards: () =>
        set((state) => ({
          settings: { ...state.settings, compactCards: !state.settings.compactCards },
        })),

      setLanguage: (lang) =>
        set((state) => ({ settings: { ...state.settings, language: lang } })),

      addInvite: (data) => {
        const invite: PendingInvite = {
          id: generateId(),
          email: data.email.trim().toLowerCase(),
          role: data.role,
          message: data.message?.trim(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ invites: [...state.invites, invite] }))
        import('@/stores/useNotificationStore').then(({ useNotificationStore }) => {
          useNotificationStore.getState().addNotification({
            type: 'invite_created',
            title: 'Invite saved',
            message: `Invite for ${data.email} (${data.role}) saved locally.`,
          })
        })
      },

      removeInvite: (id) =>
        set((state) => ({ invites: state.invites.filter((i) => i.id !== id) })),

      updateOllama: (updates) =>
        set((state) => ({ ollama: { ...state.ollama, ...updates } })),

      setOllamaStatus: (status) => set({ ollamaStatus: status }),

      setOllamaModels: (models) =>
        set((state) => ({
          ollama: { ...state.ollama, models, lastCheckedAt: new Date().toISOString() },
        })),

      updateVault: (updates) =>
        set((state) => ({ vault: { ...state.vault, ...updates } })),

      setVaultStatus: (status) =>
        set((state) => ({ vault: { ...state.vault, vaultStatus: status } })),
    }),
    {
      name: 'promptvault-user',
      storage: createJSONStorage(safeLocalStorage),
      // _hasHydrated and ollamaStatus are intentionally excluded — they reset on every load
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        settings: state.settings,
        invites: state.invites,
        vault: state.vault,
        ollama: state.ollama,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated()
      },
    }
  )
)

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
