'use client'
import { useState } from 'react'
import { X, Mail, Info, Trash2 } from 'lucide-react'
import { useUserStore } from '@/stores/useUserStore'
import { InviteRole, PendingInvite } from '@/types'
import { cn, formatDate } from '@/lib/utils'

const ROLE_LABELS: Record<InviteRole, string> = {
  viewer: 'Viewer — can view assets',
  editor: 'Editor — can create and edit',
  admin: 'Admin — full access',
}

interface InviteTeamModalProps {
  open: boolean
  onClose: () => void
}

export function InviteTeamModal({ open, onClose }: InviteTeamModalProps) {
  const { invites, addInvite, removeInvite } = useUserStore()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRole>('editor')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (invites.some((i) => i.email === email.trim().toLowerCase())) {
      setError('An invite for this email already exists.')
      return
    }
    addInvite({ email, role, message })
    setEmail('')
    setMessage('')
    setRole('editor')
    setError('')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-text-main">Invite Team Members</h2>
            <p className="text-xs text-text-muted mt-0.5">Invites are saved locally until backend is connected.</p>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text-muted p-1 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Local-only notice */}
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-accent-blue/5 border border-accent-blue/15">
            <Info size={14} className="text-accent-blue flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">
              Invites are stored locally. Email sending will be available when the Supabase backend is connected.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Email address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="colleague@example.com"
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Role</label>
              <div className="space-y-1.5">
                {(Object.keys(ROLE_LABELS) as InviteRole[]).map((r) => (
                  <label
                    key={r}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all',
                      role === r
                        ? 'border-accent-blue/40 bg-accent-blue/5'
                        : 'border-border hover:border-border-soft'
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                      className="accent-current"
                    />
                    <span className="text-xs capitalize font-medium text-text-main">{r}</span>
                    <span className="text-[10px] text-text-dim">
                      {ROLE_LABELS[r].split(' — ')[1]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Message <span className="text-text-dim font-normal">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey! I'd like to share my PromptVault workspace with you."
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
            )}

            {sent && (
              <p className="text-xs text-accent-green bg-accent-green/10 border border-accent-green/20 rounded-lg px-3 py-2">
                ✓ Invite saved locally.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Save Invite
            </button>
          </form>

          {/* Pending invites list */}
          {invites.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2 pt-1">
                Pending Invites ({invites.length})
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {invites.map((invite: PendingInvite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={12} className="text-text-dim flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-text-main truncate">{invite.email}</div>
                        <div className="text-[10px] text-text-dim">
                          {invite.role} · {formatDate(invite.createdAt)} · Pending
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeInvite(invite.id)}
                      className="text-text-dim hover:text-danger transition-colors ml-2 flex-shrink-0"
                      aria-label="Remove invite"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
