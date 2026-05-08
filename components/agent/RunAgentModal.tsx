'use client'
import { useEffect, useState } from 'react'
import { X, Play, Copy, Check, Zap, ChevronDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Asset } from '@/types'
import { cn } from '@/lib/utils'
import { copyToClipboard } from '@/lib/clipboard'
import { useAppStore } from '@/stores/useAppStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { generateWithOllama } from '@/lib/ollama'
import { buildOllamaPrompt } from '@/lib/promptBuilder'
import { detectTaskType, selectBestModel } from '@/lib/modelSelector'

function buildMockPreview(asset: Asset, input: string, context: string): string {
  const lines: string[] = []

  lines.push(`## Preview Run — ${asset.title}`)
  lines.push('')
  lines.push(`**Input:** ${input}`)
  if (context.trim()) lines.push(`**Context:** ${context}`)
  lines.push('')
  lines.push('> ⚠️  Local mock preview — no external API was called.')
  lines.push('> Connect Ollama or another model provider to run this agent for real.')
  lines.push('')
  lines.push('---')
  lines.push('')

  if (asset.systemPrompt) {
    const preview = asset.systemPrompt.slice(0, 120)
    lines.push(`**System context:** "${preview}${asset.systemPrompt.length > 120 ? '…' : ''}"`)
    lines.push('')
  }

  lines.push('### What this agent would do:')
  lines.push('')

  if (asset.instructions) {
    asset.instructions
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 6)
      .forEach((step) => {
        lines.push(`- ${step.replace(/^\d+\.\s*/, '')}`)
      })
  } else {
    lines.push(`- Receive and parse: "${input.slice(0, 80)}${input.length > 80 ? '…' : ''}"`)
    lines.push('- Apply specialised processing based on system prompt')
    lines.push('- Return structured output in the expected format')
  }

  lines.push('')

  if (asset.variables && asset.variables.length > 0) {
    lines.push('**Variables that would be substituted:**')
    asset.variables.forEach((v) => {
      lines.push(`- \`${v.name}\` → \`${v.value}\``)
    })
    lines.push('')
  }

  if (asset.tools.length > 0) {
    lines.push(`**Tools that would be invoked:** ${asset.tools.join(', ')}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(
    '*To get real output, enable Ollama in Settings → Local AI, or integrate a cloud model provider.*'
  )

  return lines.join('\n')
}

interface RunAgentModalProps {
  open: boolean
  onClose: () => void
  asset: Asset
}

export function RunAgentModal({ open, onClose, asset }: RunAgentModalProps) {
  const [step, setStep] = useState<'input' | 'result'>('input')
  const [input, setInput] = useState('')
  const [context, setContext] = useState('')
  const [result, setResult] = useState('')
  const [resultMode, setResultMode] = useState<'ollama' | 'mock'>('mock')
  const [selectedModel, setSelectedModel] = useState('')
  const [autoSelectedModel, setAutoSelectedModel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)
  const [builtPrompt, setBuiltPrompt] = useState<{ system: string; prompt: string } | null>(null)

  const { showToast } = useAppStore()
  const { ollama } = useUserStore()
  const { t } = useI18n()

  const ollamaReady = ollama.enabled && ollama.models.length > 0
  const models = ollama.models

  useEffect(() => {
    if (!open) {
      setStep('input')
      setInput('')
      setContext('')
      setResult('')
      setResultMode('mock')
      setLoading(false)
      setError('')
      setCopied(false)
      setPromptCopied(false)
      setBuiltPrompt(null)
    }
  }, [open])

  // Auto-select model when modal opens
  useEffect(() => {
    if (open && ollamaReady) {
      if (ollama.autoSelect) {
        const taskType = detectTaskType(asset)
        const best = selectBestModel(models, taskType)
        setAutoSelectedModel(best ?? models[0]?.name ?? '')
        setSelectedModel(best ?? models[0]?.name ?? '')
      } else if (ollama.preferredModel && models.some((m) => m.name === ollama.preferredModel)) {
        setSelectedModel(ollama.preferredModel)
        setAutoSelectedModel('')
      } else {
        setSelectedModel(models[0]?.name ?? '')
        setAutoSelectedModel('')
      }
    }
  }, [open, ollamaReady, ollama.autoSelect, ollama.preferredModel, models, asset])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const handleRun = async () => {
    if (!input.trim()) return
    setError('')

    if (ollamaReady && selectedModel) {
      setLoading(true)
      const built = buildOllamaPrompt(asset, input.trim(), context.trim())
      setBuiltPrompt(built)
      try {
        const response = await generateWithOllama({
          ollamaUrl: ollama.baseUrl,
          model: selectedModel,
          prompt: built.prompt,
          system: built.system,
        })
        setResult(response)
        setResultMode('ollama')
        setStep('result')
        showToast(`Response from ${selectedModel}`)
        useNotificationStore.getState().addNotification({
          type: 'asset_created',
          title: 'Agent run complete',
          message: `"${asset.title}" ran with ${selectedModel}.`,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        setError(`Ollama error: ${msg}. Falling back to mock preview.`)
        const preview = buildMockPreview(asset, input.trim(), context.trim())
        setResult(preview)
        setResultMode('mock')
        setStep('result')
      } finally {
        setLoading(false)
      }
    } else {
      const preview = buildMockPreview(asset, input.trim(), context.trim())
      setResult(preview)
      setResultMode('mock')
      setBuiltPrompt(null)
      setStep('result')
      showToast('Agent preview generated')
      useNotificationStore.getState().addNotification({
        type: 'asset_created',
        title: 'Agent preview generated',
        message: `Preview run completed for "${asset.title}".`,
      })
    }
  }

  const handleCopy = async () => {
    const ok = await copyToClipboard(result)
    if (ok) {
      setCopied(true)
      showToast(t('runAgent.resultCopied'))
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyPrompt = async () => {
    if (!builtPrompt) return
    const text = `SYSTEM:\n${builtPrompt.system}\n\nPROMPT:\n${builtPrompt.prompt}`
    const ok = await copyToClipboard(text)
    if (ok) {
      setPromptCopied(true)
      showToast(t('runAgent.promptCopied'))
      setTimeout(() => setPromptCopied(false), 2000)
    }
  }

  const handleRetry = () => {
    setStep('input')
    setError('')
    setResult('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Play size={13} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-main">{t('runAgent.titlePrefix')} {asset.title}</h2>
              <p className="text-[10px] text-text-dim mt-0.5">
                {ollamaReady
                  ? t('runAgent.ollamaSubtitle').replace('{model}', selectedModel || '—')
                  : t('runAgent.mockSubtitle')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text-muted p-1 transition-colors rounded">
            <X size={15} />
          </button>
        </div>

        {step === 'input' ? (
          <div className="p-5 space-y-4 overflow-y-auto">
            {/* Info banner */}
            <div className={cn(
              'flex items-start gap-2.5 px-3 py-2.5 rounded-lg border',
              ollamaReady
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-violet-500/5 border-violet-500/15'
            )}>
              <Zap size={13} className={cn('flex-shrink-0 mt-0.5', ollamaReady ? 'text-green-400' : 'text-violet-400')} />
              <p className="text-xs text-text-muted leading-relaxed">
                {ollamaReady
                  ? t('runAgent.ollamaInfo').replace('{model}', selectedModel)
                  : t('runAgent.mockInfo')}
              </p>
            </div>

            {/* Ollama model selector */}
            {ollamaReady && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">{t('runAgent.modelLabel')}</label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-8 text-sm rounded-lg bg-background border border-border text-text-main focus:outline-none focus:border-accent-blue/50 transition-all"
                  >
                    {models.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}{autoSelectedModel === m.name ? ` ${t('runAgent.autoSelected')}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
                </div>
                {ollama.autoSelect && autoSelectedModel && (
                  <p className="text-[10px] text-text-dim mt-1">
                    {t('runAgent.autoSelectedNote')}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                {t('runAgent.inputLabel')} <span className="text-danger">*</span>
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`e.g. "Write a LinkedIn post about AI productivity tools for engineers"`}
                rows={3}
                autoFocus
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                {t('runAgent.contextLabel')} <span className="text-text-dim font-normal">{t('runAgent.optional')}</span>
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Target audience, tone, length, or any other relevant context…"
                rows={2}
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
              />
            </div>

            {/* Variables preview */}
            {asset.variables && asset.variables.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-1.5">
                  {t('runAgent.variablesInScope')}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {asset.variables.map((v) => (
                    <span
                      key={v.name}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent-blue/10 text-blue-400 border border-accent-blue/15"
                    >
                      {v.name}={v.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleRun}
                disabled={!input.trim() || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                {loading ? t('runAgent.running') : ollamaReady ? t('runAgent.runWithOllama') : t('runAgent.runPreview')}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
              >
                {t('runAgent.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden">
            {/* Result header */}
            <div className={cn(
              'flex items-center justify-between px-5 py-2.5 border-b flex-shrink-0',
              resultMode === 'ollama'
                ? 'bg-green-500/5 border-green-500/20'
                : error
                ? 'bg-yellow-500/5 border-yellow-500/20'
                : 'bg-green-500/5 border-green-500/20'
            )}>
              <div className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                resultMode === 'ollama' ? 'text-green-400' : error ? 'text-yellow-400' : 'text-green-400'
              )}>
                {error ? <AlertCircle size={13} /> : <Check size={13} />}
                {resultMode === 'ollama'
                  ? t('runAgent.responseFrom').replace('{model}', selectedModel)
                  : error
                  ? t('runAgent.fallbackPreview')
                  : t('runAgent.previewGenerated')}
              </div>
              <button
                onClick={handleRetry}
                className="text-[11px] text-text-dim hover:text-text-muted transition-colors flex items-center gap-1"
              >
                <RefreshCw size={10} /> {t('runAgent.editInput')}
              </button>
            </div>

            {error && (
              <div className="mx-5 mt-3 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <pre className="text-[11px] text-text-muted font-mono leading-relaxed whitespace-pre-wrap break-words">
                {result}
              </pre>
            </div>

            <div className="flex items-center gap-2 px-5 py-4 border-t border-border flex-shrink-0 flex-wrap">
              <button
                onClick={handleCopy}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                  copied
                    ? 'border-green-500/30 text-green-400 bg-green-500/5'
                    : 'border-border text-text-muted hover:text-text-main hover:border-border-soft'
                )}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? t('runAgent.copied') : t('runAgent.copyResult')}
              </button>

              {builtPrompt && (
                <button
                  onClick={handleCopyPrompt}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all',
                    promptCopied
                      ? 'border-green-500/30 text-green-400 bg-green-500/5'
                      : 'border-border text-text-dim hover:text-text-muted'
                  )}
                >
                  {promptCopied ? <Check size={12} /> : <Copy size={12} />}
                  {promptCopied ? t('runAgent.copied') : t('runAgent.copyPromptSent')}
                </button>
              )}

              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-text-muted hover:text-text-main transition-colors ml-auto"
              >
                {t('runAgent.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
