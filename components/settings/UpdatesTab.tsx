'use client'
import { useState } from 'react'
import {
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Check,
  GitBranch,
  GitCommit,
  Globe,
  ShieldCheck,
  FolderLock,
  Terminal,
  Copy,
  ArrowRight,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UpdateCheckResult, UpdateInstallResult } from '@/types'
import { checkForUpdates, installUpdate } from '@/lib/updateClient'

// ── Types ──────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'checking' | 'checked' | 'installing' | 'done'

// ── Helpers ────────────────────────────────────────────────────────────────────

function shortCommit(c?: string) {
  return c ? c.slice(0, 7) : '—'
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({
  variant,
  children,
}: {
  variant: 'ok' | 'warn' | 'error' | 'info' | 'neutral'
  children: React.ReactNode
}) {
  const styles = {
    ok: 'bg-green-500/10 text-green-400 border-green-500/25',
    warn: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    error: 'bg-danger/10 text-danger border-danger/25',
    info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/25',
    neutral: 'bg-surface-soft text-text-dim border-border',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
        styles[variant]
      )}
    >
      {children}
    </span>
  )
}

function StatusRow({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ElementType
  label: string
  value?: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-5 h-5 rounded-md bg-surface-soft flex items-center justify-center flex-shrink-0">
        <Icon size={11} className="text-text-dim" />
      </div>
      <span className="text-xs text-text-muted w-32 flex-shrink-0">{label}</span>
      {value && (
        <span className="text-xs font-mono text-text-main flex-1 truncate">{value}</span>
      )}
      {badge && <div className="ml-auto flex-shrink-0">{badge}</div>}
    </div>
  )
}

function ConsolePanel({ logs }: { logs: string[] }) {
  const [open, setOpen] = useState(true)

  if (logs.length === 0) return null

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-soft hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Terminal size={12} />
          Output log
        </div>
        <span className="text-[10px] text-text-dim">{open ? '▲ hide' : '▼ show'}</span>
      </button>
      {open && (
        <div className="max-h-52 overflow-y-auto bg-[#0d0d0f] px-4 py-3">
          <pre className="text-[11px] font-mono text-green-400/90 whitespace-pre-wrap leading-relaxed">
            {logs.join('\n')}
          </pre>
        </div>
      )}
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    copyText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-muted hover:text-text-main hover:border-border-soft transition-all"
    >
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function UpdatesTab() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [checkResult, setCheckResult] = useState<UpdateCheckResult | null>(null)
  const [installResult, setInstallResult] = useState<UpdateInstallResult | null>(null)
  const [installLogs, setInstallLogs] = useState<string[]>([])

  const isChecking = phase === 'checking'
  const isInstalling = phase === 'installing'
  const busy = isChecking || isInstalling

  const restartCmd = 'npm run dev'
  const restartCmdFull = 'cd "C:\\Projects\\_Active\\PromptVault" && npm run dev'

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleCheck = async () => {
    setPhase('checking')
    setCheckResult(null)
    setInstallResult(null)
    setInstallLogs([])
    const result = await checkForUpdates()
    setCheckResult(result)
    setPhase('checked')
  }

  const handleInstall = async () => {
    if (!checkResult?.canInstall) return
    setPhase('installing')
    setInstallResult(null)
    setInstallLogs(['Connecting to install endpoint...'])
    const result = await installUpdate()
    setInstallResult(result)
    setInstallLogs(result.logs ?? [])
    setPhase('done')
  }

  // ── derived state ────────────────────────────────────────────────────────────

  const canInstallNow =
    phase === 'checked' &&
    checkResult?.canInstall === true &&
    !busy

  const updateAvailable = checkResult?.updateAvailable === true
  const alreadyUpToDate =
    checkResult?.ok === true &&
    !updateAvailable &&
    (checkResult?.errors?.length ?? 0) === 0

  const installSucceeded = installResult?.success === true
  const restartRequired = installResult?.restartRequired === true

  // ── summary badge ────────────────────────────────────────────────────────────

  function OverallBadge() {
    if (phase === 'idle') return null
    if (phase === 'checking') return <StatusBadge variant="info"><Loader2 size={9} className="animate-spin" /> Checking…</StatusBadge>
    if (phase === 'installing') return <StatusBadge variant="info"><Loader2 size={9} className="animate-spin" /> Installing…</StatusBadge>
    if (restartRequired) return <StatusBadge variant="warn"><CheckCircle2 size={9} /> Installed — restart required</StatusBadge>
    if (installResult && !installSucceeded) return <StatusBadge variant="error"><XCircle size={9} /> Install failed</StatusBadge>
    if (alreadyUpToDate) return <StatusBadge variant="ok"><CheckCircle2 size={9} /> Up to date</StatusBadge>
    if (updateAvailable && checkResult?.canInstall) return <StatusBadge variant="info"><ArrowRight size={9} /> Update available</StatusBadge>
    if (updateAvailable && !checkResult?.canInstall) return <StatusBadge variant="warn"><AlertTriangle size={9} /> Update available — blocked</StatusBadge>
    if (checkResult && !checkResult.ok) return <StatusBadge variant="error"><XCircle size={9} /> Check failed</StatusBadge>
    return null
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
            App Updates
          </span>
          <OverallBadge />
        </div>
        <p className="text-xs text-text-dim leading-relaxed max-w-md">
          Update PromptVault from the GitHub <code className="text-text-muted">main</code> branch.
          Your local vault files are never touched — they stay on this computer and are excluded from git.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleCheck}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-muted hover:text-text-main hover:border-accent-blue/40 hover:bg-surface-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isChecking
            ? <Loader2 size={13} className="animate-spin text-accent-blue" />
            : <RefreshCw size={13} />}
          Check for updates
        </button>

        <button
          onClick={handleInstall}
          disabled={!canInstallNow || busy}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all',
            canInstallNow
              ? 'bg-accent-blue hover:bg-blue-500 text-white shadow-glow hover:shadow-none'
              : 'bg-surface border border-border text-text-dim cursor-not-allowed opacity-50'
          )}
        >
          {isInstalling
            ? <Loader2 size={13} className="animate-spin" />
            : <Download size={13} />}
          {isInstalling ? 'Installing…' : 'Install update'}
        </button>
      </div>

      {/* Status grid */}
      {checkResult && (
        <div className="rounded-xl border border-border overflow-hidden bg-surface/50">
          <StatusRow
            icon={GitCommit}
            label="Current commit"
            value={shortCommit(checkResult.currentCommit)}
          />
          <StatusRow
            icon={GitCommit}
            label="Latest commit"
            value={shortCommit(checkResult.latestCommit)}
            badge={
              alreadyUpToDate ? (
                <StatusBadge variant="ok"><Check size={9} /> Up to date</StatusBadge>
              ) : updateAvailable ? (
                <StatusBadge variant="info"><ArrowRight size={9} /> New version</StatusBadge>
              ) : null
            }
          />
          <StatusRow
            icon={GitBranch}
            label="Branch"
            value={checkResult.branch ?? '—'}
          />
          <StatusRow
            icon={Globe}
            label="Remote"
            value={checkResult.remoteUrl ?? '—'}
            badge={
              checkResult.remoteUrl ? (
                <StatusBadge variant="ok"><ShieldCheck size={9} /> Verified</StatusBadge>
              ) : (
                <StatusBadge variant="error"><XCircle size={9} /> Missing</StatusBadge>
              )
            }
          />
          <StatusRow
            icon={ShieldCheck}
            label="Working tree"
            badge={
              checkResult.workingTreeClean ? (
                <StatusBadge variant="ok"><Check size={9} /> Clean</StatusBadge>
              ) : (
                <StatusBadge variant="error"><XCircle size={9} /> Has changes</StatusBadge>
              )
            }
          />
          <StatusRow
            icon={FolderLock}
            label="vault/ ignored"
            badge={
              checkResult.vaultIgnored ? (
                <StatusBadge variant="ok"><Check size={9} /> Yes — data is safe</StatusBadge>
              ) : (
                <StatusBadge variant="error"><XCircle size={9} /> Not ignored</StatusBadge>
              )
            }
          />
        </div>
      )}

      {/* Errors */}
      {checkResult && checkResult.errors.length > 0 && (
        <div className="space-y-1.5">
          {checkResult.errors.map((e, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-danger/5 border border-danger/20"
            >
              <XCircle size={12} className="text-danger flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-danger leading-snug">{e}</p>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {checkResult && checkResult.warnings.length > 0 && (
        <div className="space-y-1.5">
          {checkResult.warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20"
            >
              <Info size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-400/90 leading-snug">{w}</p>
            </div>
          ))}
        </div>
      )}

      {/* Install result banner */}
      {installResult && (
        <div
          className={cn(
            'flex items-start gap-3 px-4 py-3.5 rounded-xl border',
            installSucceeded
              ? 'bg-green-500/5 border-green-500/20'
              : 'bg-danger/5 border-danger/20'
          )}
        >
          {installSucceeded ? (
            <CheckCircle2 size={15} className="text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          )}
          <div>
            {installSucceeded ? (
              <>
                <p className="text-sm font-semibold text-green-400 leading-tight">
                  Update installed successfully.
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Restart PromptVault to use the new version.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-danger leading-tight">
                  Install did not complete.
                </p>
                {installResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-danger/80 mt-1">{e}</p>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Console output */}
      <ConsolePanel logs={installLogs} />

      {/* Restart section */}
      {(restartRequired || phase === 'done') && (
        <div className="space-y-3">
          <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
            Restart PromptVault
          </div>
          <div className="p-3.5 rounded-xl bg-surface-soft border border-border space-y-2">
            <p className="text-[11px] text-text-muted">
              Stop the current server and run one of these commands to restart:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono text-text-main bg-background border border-border rounded-lg px-3 py-2 truncate">
                {restartCmd}
              </code>
              <CopyButton text={restartCmd} label="Copy" />
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono text-text-dim bg-background border border-border rounded-lg px-3 py-2 truncate">
                {restartCmdFull}
              </code>
              <CopyButton text={restartCmdFull} label="Copy" />
            </div>
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="p-3.5 rounded-xl bg-surface-soft border border-border">
        <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
          How this updater works
        </div>
        <ul className="space-y-1">
          {[
            'Verifies the remote is the official PromptVault repository.',
            'Blocks install if the working tree has uncommitted code changes.',
            'Blocks install if vault/ is not git-ignored (your data is never at risk).',
            'Runs: git pull --ff-only origin main → npm install → npm run build.',
            'Never force-pulls, force-pushes, hard-resets, or deletes local files.',
            'Requires a manual restart — nothing is killed automatically.',
          ].map((line) => (
            <li key={line} className="flex items-start gap-2 text-[11px] text-text-dim">
              <Check size={10} className="text-accent-blue flex-shrink-0 mt-0.5" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
