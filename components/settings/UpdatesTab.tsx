'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n/useI18n'
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
  Wrench,
  PackageCheck,
  Hammer,
  RotateCcw,
  GitPullRequest,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UpdateCheckResult, UpdateInstallResult } from '@/types'
import { checkForUpdates, installUpdate, cleanGeneratedChanges } from '@/lib/updateClient'

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

function StepRow({
  icon: Icon,
  label,
  state,
  t,
}: {
  icon: React.ElementType
  label: string
  state: 'ok' | 'failed' | 'skipped' | 'pending'
  t: (key: string) => string
}) {
  const badge =
    state === 'ok' ? (
      <StatusBadge variant="ok"><Check size={9} /> {t('updates.badgeCompleted')}</StatusBadge>
    ) : state === 'failed' ? (
      <StatusBadge variant="error"><XCircle size={9} /> {t('updates.badgeFailed')}</StatusBadge>
    ) : state === 'skipped' ? (
      <StatusBadge variant="neutral">{t('updates.badgeSkipped')}</StatusBadge>
    ) : (
      <StatusBadge variant="neutral">—</StatusBadge>
    )

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div
        className={cn(
          'w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0',
          state === 'ok'
            ? 'bg-green-500/10'
            : state === 'failed'
            ? 'bg-danger/10'
            : 'bg-surface-soft'
        )}
      >
        <Icon
          size={11}
          className={cn(
            state === 'ok'
              ? 'text-green-400'
              : state === 'failed'
              ? 'text-danger'
              : 'text-text-dim'
          )}
        />
      </div>
      <span className="text-xs text-text-muted flex-1">{label}</span>
      <div className="flex-shrink-0">{badge}</div>
    </div>
  )
}

function ConsolePanel({ logs, t }: { logs: string[]; t: (key: string) => string }) {
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
          {t('updates.outputLog')}
        </div>
        <span className="text-[10px] text-text-dim">{open ? t('updates.hide') : t('updates.show')}</span>
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

function CopyButton({ text, label, t }: { text: string; label: string; t: (key: string) => string }) {
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
      {copied ? t('updates.copiedBtn') : label}
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function UpdatesTab() {
  const { t } = useI18n()
  const [phase, setPhase] = useState<Phase>('idle')
  const [checkResult, setCheckResult] = useState<UpdateCheckResult | null>(null)
  const [installResult, setInstallResult] = useState<UpdateInstallResult | null>(null)
  const [installLogs, setInstallLogs] = useState<string[]>([])
  const [isCleaning, setIsCleaning] = useState(false)
  const [cleanLogs, setCleanLogs] = useState<string[]>([])

  const isChecking = phase === 'checking'
  const isInstalling = phase === 'installing'
  const busy = isChecking || isInstalling || isCleaning

  const restartCmd = 'npm run dev'
  const restartCmdFull = 'cd "C:\\Projects\\_Active\\PromptVault" && npm run dev'
  const manualFixCmd =
    'cd "C:\\Projects\\_Active\\PromptVault"\nnpm install\nnpm run build\nnpm run dev'

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

  const handleClean = async () => {
    setIsCleaning(true)
    setCleanLogs([])
    const result = await cleanGeneratedChanges()
    setCleanLogs(result.logs ?? [])
    setIsCleaning(false)
    await handleCheck()
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
  const partialSuccess = installResult?.partialSuccess === true
  const restartRequired = installResult?.restartRequired === true

  // Step states for the step breakdown grid
  function stepState(flag: boolean | undefined, preceding: boolean | undefined): 'ok' | 'failed' | 'skipped' | 'pending' {
    if (preceding === false) return 'skipped'
    if (flag === true) return 'ok'
    if (flag === false) return 'failed'
    return 'pending'
  }

  // ── summary badge ────────────────────────────────────────────────────────────

  function OverallBadge() {
    if (phase === 'idle') return null
    if (phase === 'checking') return <StatusBadge variant="info"><Loader2 size={9} className="animate-spin" /> {t('updates.badgeChecking')}</StatusBadge>
    if (phase === 'installing') return <StatusBadge variant="info"><Loader2 size={9} className="animate-spin" /> {t('updates.badgeInstalling')}</StatusBadge>
    if (installSucceeded && restartRequired) return <StatusBadge variant="ok"><CheckCircle2 size={9} /> {t('updates.badgeInstalled')}</StatusBadge>
    if (partialSuccess) return <StatusBadge variant="warn"><AlertTriangle size={9} /> {t('updates.badgeDownloaded')}</StatusBadge>
    if (installResult && !installSucceeded && !partialSuccess) return <StatusBadge variant="error"><XCircle size={9} /> {t('updates.badgeDownloadFailed')}</StatusBadge>
    if (alreadyUpToDate) return <StatusBadge variant="ok"><CheckCircle2 size={9} /> {t('updates.badgeUpToDate')}</StatusBadge>
    if (updateAvailable && checkResult?.canInstall) return <StatusBadge variant="info"><ArrowRight size={9} /> {t('updates.badgeUpdateAvailable')}</StatusBadge>
    if (updateAvailable && !checkResult?.canInstall) return <StatusBadge variant="warn"><AlertTriangle size={9} /> {t('updates.badgeUpdateBlocked')}</StatusBadge>
    if (checkResult && !checkResult.ok) return <StatusBadge variant="error"><XCircle size={9} /> {t('updates.badgeCheckFailed')}</StatusBadge>
    return null
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
            {t('updates.heading')}
          </span>
          <OverallBadge />
        </div>
        <p className="text-xs text-text-dim leading-relaxed max-w-md">
          {t('updates.desc')}
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
          {t('updates.checkForUpdates')}
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
          {isInstalling ? t('updates.installing') : t('updates.installUpdate')}
        </button>
      </div>

      {/* Status grid */}
      {checkResult && (
        <div className="rounded-xl border border-border overflow-hidden bg-surface/50">
          <StatusRow
            icon={GitCommit}
            label={t('updates.labelCurrentCommit')}
            value={shortCommit(checkResult.currentCommit)}
          />
          <StatusRow
            icon={GitCommit}
            label={t('updates.labelLatestCommit')}
            value={shortCommit(checkResult.latestCommit)}
            badge={
              alreadyUpToDate ? (
                <StatusBadge variant="ok"><Check size={9} /> {t('updates.badgeUpToDate')}</StatusBadge>
              ) : updateAvailable ? (
                <StatusBadge variant="info"><ArrowRight size={9} /> {t('updates.badgeNewVersion')}</StatusBadge>
              ) : null
            }
          />
          <StatusRow
            icon={GitBranch}
            label={t('updates.labelBranch')}
            value={checkResult.branch ?? '—'}
          />
          <StatusRow
            icon={Globe}
            label={t('updates.labelRemote')}
            value={checkResult.remoteUrl ?? '—'}
            badge={
              checkResult.remoteUrl ? (
                <StatusBadge variant="ok"><ShieldCheck size={9} /> {t('updates.badgeVerified')}</StatusBadge>
              ) : (
                <StatusBadge variant="error"><XCircle size={9} /> {t('updates.badgeMissing')}</StatusBadge>
              )
            }
          />
          <StatusRow
            icon={ShieldCheck}
            label={t('updates.labelWorkingTree')}
            badge={
              checkResult.workingTreeClean ? (
                <StatusBadge variant="ok"><Check size={9} /> {t('updates.badgeClean')}</StatusBadge>
              ) : checkResult.onlyAutoFixableChanges ? (
                <StatusBadge variant="warn"><AlertTriangle size={9} /> {t('updates.badgeGenChanged')}</StatusBadge>
              ) : (
                <StatusBadge variant="error"><XCircle size={9} /> {t('updates.badgeHasChanges')}</StatusBadge>
              )
            }
          />
          <StatusRow
            icon={FolderLock}
            label={t('updates.labelVaultIgnored')}
            badge={
              checkResult.vaultIgnored ? (
                <StatusBadge variant="ok"><Check size={9} /> {t('updates.badgeSafe')}</StatusBadge>
              ) : (
                <StatusBadge variant="error"><XCircle size={9} /> {t('updates.badgeNotIgnored')}</StatusBadge>
              )
            }
          />
        </div>
      )}

      {/* Auto-fixable: only generated/install files changed */}
      {checkResult?.onlyAutoFixableChanges && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-300">
                {t('updates.genFilesTitle')}
              </p>
              <ul className="space-y-0.5">
                {checkResult.autoFixableDirtyFiles?.map((f) => (
                  <li key={f} className="text-[11px] font-mono text-amber-400/80">
                    · {f}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-400/70 leading-snug">
                {t('updates.genFilesDesc')}{' '}
                <span className="text-amber-300 font-medium">
                  {t('updates.genFilesSafe')}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClean}
            disabled={isCleaning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCleaning
              ? <Loader2 size={12} className="animate-spin" />
              : <Wrench size={12} />}
            {isCleaning ? t('updates.cleaning') : t('updates.cleanGenerated')}
          </button>
          {cleanLogs.length > 0 && (
            <div className="rounded-lg bg-[#0d0d0f] px-3 py-2 max-h-28 overflow-y-auto">
              <pre className="text-[10px] font-mono text-green-400/80 whitespace-pre-wrap leading-relaxed">
                {cleanLogs.join('\n')}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Blocking dirty files */}
      {(checkResult?.blockingDirtyFiles?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-danger/25 bg-danger/5 p-4 space-y-2">
          <div className="flex items-start gap-2.5">
            <XCircle size={14} className="text-danger flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <p className="text-xs font-semibold text-danger">
                {t('updates.blockingTitle')}
              </p>
              <ul className="space-y-0.5">
                {checkResult!.blockingDirtyFiles!.map((f) => (
                  <li key={f} className="text-[11px] font-mono text-danger/70">
                    · {f}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-danger/70 leading-snug">
                {t('updates.blockingDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Other check errors */}
      {checkResult && checkResult.errors.length > 0 && (checkResult.blockingDirtyFiles?.length ?? 0) === 0 && (
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

      {/* General warnings */}
      {checkResult && !checkResult.onlyAutoFixableChanges && checkResult.warnings.length > 0 && (
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
              : partialSuccess
              ? 'bg-amber-500/5 border-amber-500/20'
              : 'bg-danger/5 border-danger/20'
          )}
        >
          {installSucceeded ? (
            <CheckCircle2 size={15} className="text-green-400 flex-shrink-0 mt-0.5" />
          ) : partialSuccess ? (
            <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          )}
          <div>
            {installSucceeded ? (
              <>
                <p className="text-sm font-semibold text-green-400 leading-tight">
                  {t('updates.installedTitle')}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {t('updates.installedDesc')}
                </p>
              </>
            ) : partialSuccess ? (
              <>
                <p className="text-sm font-semibold text-amber-300 leading-tight">
                  {t('updates.partialTitle')}
                </p>
                <p className="text-xs text-amber-400/80 mt-1">
                  {installResult.message ?? t('updates.partialDescDefault')}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-danger leading-tight">
                  {t('updates.failedTitle')}
                </p>
                {installResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-danger/80 mt-1">{e}</p>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Step-by-step breakdown (shown after any install attempt) */}
      {installResult && (installSucceeded || partialSuccess || installResult.gitUpdated !== undefined) && (
        <div className="rounded-xl border border-border overflow-hidden bg-surface/50">
          <div className="px-4 py-2.5 bg-surface-soft border-b border-border">
            <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
              {t('updates.stepsHeading')}
            </span>
          </div>
          <div className="px-4">
            <StepRow icon={GitPullRequest} label={t('updates.stepDownload')}      state={stepState(installResult.gitUpdated, true)}                               t={t} />
            <StepRow icon={PackageCheck}   label={t('updates.stepDependencies')}  state={stepState(installResult.npmInstallOk, installResult.gitUpdated)}         t={t} />
            <StepRow icon={Hammer}         label={t('updates.stepBuild')}         state={stepState(installResult.buildOk, installResult.npmInstallOk)}            t={t} />
            <StepRow icon={RotateCcw}      label={t('updates.stepRestart')}       state={restartRequired ? 'ok' : 'pending'}                                      t={t} />
          </div>
        </div>
      )}

      {/* Console output */}
      <ConsolePanel logs={installLogs} t={t} />

      {/* Partial success — manual fix panel */}
      {partialSuccess && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <Wrench size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-300">
                {t('updates.manualFixTitle')}
              </p>
              <p className="text-[11px] text-amber-400/70 leading-snug">
                {t('updates.manualFixDesc')}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-[#0d0d0f] px-4 py-3 border border-amber-500/15">
            <pre className="text-[11px] font-mono text-amber-300/90 whitespace-pre leading-relaxed">
              {`cd "C:\\Projects\\_Active\\PromptVault"\nnpm install\nnpm run build\nnpm run dev`}
            </pre>
          </div>
          <CopyButton text={manualFixCmd} label={t('updates.copyCommands')} t={t} />
        </div>
      )}

      {/* Restart section */}
      {(restartRequired || phase === 'done') && (
        <div className="space-y-3">
          <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
            {t('updates.restartHeading')}
          </div>
          <div className="p-3.5 rounded-xl bg-surface-soft border border-border space-y-2">
            <p className="text-[11px] text-text-muted">
              {t('updates.restartDesc')}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono text-text-main bg-background border border-border rounded-lg px-3 py-2 truncate">
                {restartCmd}
              </code>
              <CopyButton text={restartCmd} label={t('updates.copyBtn')} t={t} />
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono text-text-dim bg-background border border-border rounded-lg px-3 py-2 truncate">
                {restartCmdFull}
              </code>
              <CopyButton text={restartCmdFull} label={t('updates.copyBtn')} t={t} />
            </div>
          </div>
        </div>
      )}

      {/* Build Info */}
      <div className="p-3.5 rounded-xl bg-surface-soft border border-border">
        <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2.5">
          {t('updates.buildInfoHeading')}
        </div>
        <div className="space-y-1.5">
          {[
            { label: 'App',           value: 'PromptVault' },
            { label: 'Build',         value: 'Partial success build 003' },
            { label: 'Mode',          value: 'Local-first' },
            { label: 'Update source', value: 'GitHub main branch' },
            { label: 'Vault safety',  value: 'vault/ ignored — never uploaded' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[10px] text-text-dim w-24 flex-shrink-0">{label}</span>
              <span className="text-[11px] font-mono text-text-muted">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How this updater works */}
      <div className="p-3.5 rounded-xl bg-surface-soft border border-border">
        <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
          {t('updates.howItWorksHeading')}
        </div>
        <ul className="space-y-1">
          {[
            'Verifies the remote is the official PromptVault repository.',
            'Blocks install if the working tree has uncommitted code changes.',
            'Blocks install if vault/ is not git-ignored (your data is never at risk).',
            'Phase 1: Download — git pull --ff-only origin main.',
            'Phase 2: Dependencies — npm install.',
            'Phase 3: Verify — npm run build.',
            'If download succeeds but npm/build fail, a partial-success warning is shown with manual fix commands.',
            'Never force-pulls, hard-resets, or deletes local files.',
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
