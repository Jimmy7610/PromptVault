'use client'
import { useState } from 'react'
import {
  ArrowRight,
  Bot,
  Sparkles,
  FileText,
  Code2,
  GitBranch,
  Layout,
  Image,
  HardDrive,
  Cpu,
  Shield,
  UserX,
  BookOpen,
} from 'lucide-react'
import { useUserStore, getUserInitials } from '@/stores/useUserStore'
import { cn } from '@/lib/utils'
import { AppGuideModal } from '@/components/settings/AppGuideModal'

// ── Logo ───────────────────────────────────────────────────────────────────────

function VaultLogo() {
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center shadow-glow flex-shrink-0">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="2" stroke="white" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="2" stroke="white" strokeWidth="1.5" />
        <line x1="8" y1="6" x2="8" y2="3" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

// ── Compact feature card (left column grid) ────────────────────────────────────

const FEATURES = [
  { icon: Bot,       label: 'Agents',     desc: 'System prompts & variables' },
  { icon: Sparkles,  label: 'Prompts',    desc: 'Image, text, code, music' },
  { icon: Image,     label: 'Images',     desc: 'Midjourney, DALL·E refs' },
  { icon: FileText,  label: 'Markdown',   desc: 'Notes & documentation' },
  { icon: Code2,     label: 'Code',       desc: 'Reusable snippets' },
  { icon: GitBranch, label: 'Workflows',  desc: 'Multi-step AI pipelines' },
  { icon: HardDrive, label: 'Local Vault',desc: 'Assets as real files' },
  { icon: Cpu,       label: 'Ollama',     desc: 'Local models, no API key' },
]

function FeatureCard({ icon: Icon, label, desc }: { icon: React.ElementType; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-surface border border-border hover:border-accent-blue/25 hover:bg-surface-hover transition-all group">
      <div className="w-6 h-6 rounded-lg bg-accent-blue/10 group-hover:bg-accent-blue/15 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
        <Icon size={11} className="text-accent-blue" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-text-main leading-tight">{label}</div>
        <div className="text-[10px] text-text-dim mt-0.5 leading-tight truncate">{desc}</div>
      </div>
    </div>
  )
}

// ── Login card (right column) ──────────────────────────────────────────────────

function LoginCard() {
  const { user, login, resumeSession } = useUserStore()
  const [mode, setMode] = useState<'returning' | 'new'>(user ? 'returning' : 'new')
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    workspaceName: user?.workspaceName ?? '',
  })
  const [error, setError] = useState('')
  const initials = user ? getUserInitials(user.name) : ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.email.trim() || !form.email.includes('@')) { setError('A valid email is required.'); return }
    login({ name: form.name, email: form.email, workspaceName: form.workspaceName })
  }

  if (mode === 'returning' && user) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center mb-3 flex-shrink-0 shadow-glow">
          <span className="text-base font-bold text-white">{initials}</span>
        </div>
        <p className="text-[11px] text-text-muted tracking-wide uppercase font-medium">Welcome back</p>
        <p className="text-sm font-semibold text-text-main mt-1">{user.name}</p>
        <p className="text-xs text-text-dim mt-0.5">{user.email}</p>
        {user.workspaceName && (
          <p className="text-[10px] text-text-dim mt-1 bg-surface-soft border border-border px-2 py-0.5 rounded-full">{user.workspaceName}</p>
        )}
        <button
          onClick={resumeSession}
          className="w-full flex items-center justify-center gap-2 mt-5 py-2.5 rounded-xl bg-accent-blue hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-glow hover:shadow-none"
        >
          Continue as {user.name.split(' ')[0]}
          <ArrowRight size={14} />
        </button>
        <button
          onClick={() => setMode('new')}
          className="flex items-center gap-1.5 mt-3 text-xs text-text-dim hover:text-text-muted transition-colors"
        >
          <UserX size={11} />
          Use a different account
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-sm font-semibold text-text-main">
          {user ? 'Update your details' : 'Create your workspace'}
        </p>
        <p className="text-xs text-text-dim mt-0.5">
          {user ? 'Edit and continue.' : 'No account needed — data stays local.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label className="block text-[11px] font-medium text-text-muted mb-1">
            Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setError('') }}
            placeholder="Alex Smith"
            autoFocus
            className="w-full px-3 py-[7px] text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/60 transition-all"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-text-muted mb-1">
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setError('') }}
            placeholder="you@example.com"
            className="w-full px-3 py-[7px] text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/60 transition-all"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-text-muted mb-1">
            Workspace <span className="text-[10px] text-text-dim font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.workspaceName}
            onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
            placeholder="My AI Studio"
            className="w-full px-3 py-[7px] text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/60 transition-all"
          />
        </div>

        {error && (
          <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-blue hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-glow hover:shadow-none mt-1"
        >
          {user ? 'Save & Continue' : 'Get Started'}
          <ArrowRight size={14} />
        </button>

        {user && (
          <button
            type="button"
            onClick={() => setMode('returning')}
            className="w-full py-1.5 text-xs text-text-dim hover:text-text-muted transition-colors"
          >
            Cancel
          </button>
        )}
      </form>

      <p className="text-[10px] text-text-dim text-center mt-3">
        All data stored locally · No cloud account required
      </p>
    </>
  )
}

// ── Dashboard preview (window-framed) ──────────────────────────────────────────

function DashboardPreview() {
  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden border border-border/80 bg-surface shadow-card">
      {/* macOS-style window chrome */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3.5 h-8 bg-surface-soft border-b border-border/60">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60 flex-shrink-0" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 flex-shrink-0" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50 flex-shrink-0" />
        <span className="text-[10px] text-text-dim ml-2 font-mono tracking-tight select-none">
          PromptVault — AI Workspace
        </span>
      </div>
      {/* Screenshot */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <img
          src="/screenshots/dashboard.png"
          alt="PromptVault dashboard"
          className="w-full h-full object-cover object-top"
          draggable={false}
        />
      </div>
    </div>
  )
}

// ── Main landing page ──────────────────────────────────────────────────────────

export function LandingPage() {
  const [guideOpen, setGuideOpen] = useState(false)

  return (
    // Full-viewport, no scroll
    <div className="h-screen w-screen overflow-hidden bg-background relative">

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[500px] bg-accent-blue/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-accent-violet/[0.05] rounded-full blur-3xl" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* ── Centered max-width shell ─────────────────────────────────────────── */}
      <div className="relative z-10 h-full max-w-[1400px] mx-auto px-8 flex flex-col">

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between h-[52px]">
          <div className="flex items-center gap-2.5">
            <VaultLogo />
            <span className="text-sm font-bold text-text-main tracking-tight">PromptVault</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-[11px] text-text-dim hidden md:block">
              Local-first · Open source · No cloud required
            </span>
          </div>
        </header>

        {/* ── Two-column main grid ─────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_420px] gap-8 pb-5">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col justify-center gap-5 overflow-hidden">

            {/* Badge */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-[11px] text-accent-blue font-medium">
                <Shield size={10} />
                Local-first AI Workspace
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-[11px] text-text-dim">
                <Cpu size={10} />
                Optional Ollama
              </div>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-[2.6rem] xl:text-[3rem] font-extrabold text-text-main leading-[1.15] tracking-tight">
                Your local-first workspace
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-blue-400 to-accent-violet">
                  for agents, prompts &amp; AI workflows
                </span>
              </h1>
              <p className="text-[15px] text-text-muted leading-relaxed mt-3 max-w-[520px]">
                Organize, run, test, copy, store, and reuse your best AI assets — locally.
                No cloud. No subscription. No API key required.
              </p>
            </div>

            {/* Info CTA — no login action here */}
            <div>
              <button
                onClick={() => setGuideOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-text-muted hover:text-text-main hover:border-accent-blue/40 hover:bg-surface-hover transition-all"
              >
                <BookOpen size={14} className="text-accent-blue" />
                What is PromptVault?
              </button>
            </div>

            {/* Demo assets notice */}
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 max-w-[520px]">
              <Sparkles size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-300/90 leading-snug">
                <span className="font-semibold text-amber-300">Demo assets included.</span>{' '}
                The library shows example assets on first launch — safely delete them and replace with your own.
              </p>
            </div>

            {/* Feature cards */}
            <div>
              <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest mb-2.5">
                What you can store
              </p>
              <div className="grid grid-cols-4 gap-2">
                {FEATURES.map((f) => (
                  <FeatureCard key={f.label} icon={f.icon} label={f.label} desc={f.desc} />
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-4 py-4 min-h-0">

            {/* Login / continue card */}
            <div className="flex-shrink-0 bg-surface/90 backdrop-blur-sm border border-border rounded-2xl px-6 py-5 shadow-2xl">
              <LoginCard />
            </div>

            {/* Dashboard preview */}
            <DashboardPreview />

          </div>
        </div>
      </div>

      <AppGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  )
}
