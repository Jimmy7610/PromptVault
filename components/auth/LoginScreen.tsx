'use client'
import { useState } from 'react'
import { ArrowRight, UserX } from 'lucide-react'
import { useUserStore, getUserInitials } from '@/stores/useUserStore'

function VaultLogo() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center mb-4 shadow-glow">
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="2" stroke="white" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2" stroke="white" strokeWidth="1.5" />
        <line x1="8" y1="6" x2="8" y2="3" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export function LoginScreen() {
  const { user, login, resumeSession } = useUserStore()

  // If a saved profile exists → default to "returning" mode
  const [mode, setMode] = useState<'returning' | 'new'>(user ? 'returning' : 'new')
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    workspaceName: user?.workspaceName ?? '',
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('A valid email is required.')
      return
    }
    login({ name: form.name, email: form.email, workspaceName: form.workspaceName })
  }

  const initials = user ? getUserInitials(user.name) : ''

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-accent-violet/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <VaultLogo />
          <h1 className="text-2xl font-bold text-text-main">PromptVault</h1>
          <p className="text-text-muted text-sm mt-1">Universal AI Workspace</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl">
          {/* ── Returning user mode ── */}
          {mode === 'returning' && user ? (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-white">{initials}</span>
                </div>
                <h2 className="text-base font-semibold text-text-main">Welcome back</h2>
                <p className="text-sm text-text-muted mt-0.5">{user.name}</p>
                <p className="text-xs text-text-dim">{user.email}</p>
                {user.workspaceName && (
                  <p className="text-[10px] text-text-dim mt-1">{user.workspaceName}</p>
                )}
              </div>

              <button
                onClick={resumeSession}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-blue hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                Continue as {user.name.split(' ')[0]}
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => setMode('new')}
                className="w-full flex items-center justify-center gap-1.5 mt-3 py-2 text-xs text-text-muted hover:text-text-main transition-colors"
              >
                <UserX size={13} />
                Use a different account
              </button>
            </>
          ) : (
            /* ── New / edit profile mode ── */
            <>
              <h2 className="text-base font-semibold text-text-main mb-1">
                {user ? 'Update your details' : 'Create your workspace'}
              </h2>
              <p className="text-xs text-text-muted mb-5">
                {user
                  ? 'Edit your profile and continue.'
                  : 'Enter your details to get started. Everything is stored locally on this device.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Your Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setError('') }}
                    placeholder="Alex Smith"
                    autoFocus
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setError('') }}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    Workspace Name{' '}
                    <span className="text-text-dim font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.workspaceName}
                    onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                    placeholder="My AI Studio"
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                  />
                </div>

                {error && (
                  <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-accent-blue hover:bg-blue-500 text-white text-sm font-medium transition-colors mt-2"
                >
                  {user ? 'Save & Continue' : 'Get Started'}
                </button>

                {user && (
                  <button
                    type="button"
                    onClick={() => setMode('returning')}
                    className="w-full py-2 text-xs text-text-muted hover:text-text-main transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </form>

              <p className="text-[10px] text-text-dim text-center mt-4">
                No account required. All data is saved locally in your browser.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
