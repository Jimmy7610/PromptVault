'use client'
import { useEffect, useState } from 'react'
import { X, FlaskConical, Check, AlertCircle, Info, Play, Loader2, ChevronDown } from 'lucide-react'
import { Asset } from '@/types'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useUserStore } from '@/stores/useUserStore'
import { generateWithOllama } from '@/lib/ollama'
import { buildOllamaPrompt } from '@/lib/promptBuilder'
import { detectTaskType, selectBestModel } from '@/lib/modelSelector'

interface CheckItem {
  label: string
  detail: string
  pass: boolean
  warn?: boolean
}

function buildChecklist(asset: Asset, input: string): CheckItem[] {
  return [
    {
      label: 'Test input received',
      detail: `${input.trim().length} chars`,
      pass: input.trim().length > 0,
    },
    {
      label: 'System prompt configured',
      detail: asset.systemPrompt ? `${asset.systemPrompt.length} chars` : 'not set',
      pass: !!asset.systemPrompt,
      warn: !asset.systemPrompt,
    },
    {
      label: 'Instructions defined',
      detail: asset.instructions
        ? `${asset.instructions.split('\n').filter(Boolean).length} steps`
        : 'not set',
      pass: !!asset.instructions,
      warn: !asset.instructions,
    },
    {
      label: 'Variables ready',
      detail:
        asset.variables && asset.variables.length > 0
          ? `${asset.variables.length} variable${asset.variables.length !== 1 ? 's' : ''}`
          : 'none',
      pass: true,
    },
    {
      label: 'Tools configured',
      detail:
        asset.tools.length > 0
          ? asset.tools.slice(0, 3).join(', ') + (asset.tools.length > 3 ? '…' : '')
          : 'none',
      pass: asset.tools.length > 0,
      warn: asset.tools.length === 0,
    },
    {
      label: 'Input/output structure',
      detail: asset.exampleOutput ? 'example output present' : 'no example provided',
      pass: !!asset.exampleOutput,
      warn: !asset.exampleOutput,
    },
  ]
}

interface TestAgentModalProps {
  open: boolean
  onClose: () => void
  asset: Asset
}

export function TestAgentModal({ open, onClose, asset }: TestAgentModalProps) {
  const [step, setStep] = useState<'input' | 'result'>('input')
  const [testInput, setTestInput] = useState('')
  const [error, setError] = useState('')
  const [checklist, setChecklist] = useState<CheckItem[]>([])

  // Ollama test state
  const [ollamaTestLoading, setOllamaTestLoading] = useState(false)
  const [ollamaTestResult, setOllamaTestResult] = useState('')
  const [ollamaTestError, setOllamaTestError] = useState('')
  const [ollamaTestModel, setOllamaTestModel] = useState('')
  const [ollamaTestTime, setOllamaTestTime] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState('')

  const { showToast } = useAppStore()
  const { ollama } = useUserStore()

  const ollamaReady = ollama.enabled && ollama.models.length > 0

  useEffect(() => {
    if (!open) {
      setStep('input')
      setTestInput('')
      setError('')
      setChecklist([])
      setOllamaTestLoading(false)
      setOllamaTestResult('')
      setOllamaTestError('')
      setOllamaTestModel('')
      setOllamaTestTime(null)
    }
  }, [open])

  useEffect(() => {
    if (open && ollamaReady) {
      if (ollama.autoSelect) {
        const taskType = detectTaskType(asset)
        const best = selectBestModel(ollama.models, taskType)
        setSelectedModel(best ?? ollama.models[0]?.name ?? '')
      } else if (ollama.preferredModel && ollama.models.some((m) => m.name === ollama.preferredModel)) {
        setSelectedModel(ollama.preferredModel)
      } else {
        setSelectedModel(ollama.models[0]?.name ?? '')
      }
    }
  }, [open, ollamaReady, ollama.autoSelect, ollama.preferredModel, ollama.models, asset])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const handleTest = () => {
    if (!testInput.trim()) {
      setError('Please enter a test input.')
      return
    }
    setError('')
    setChecklist(buildChecklist(asset, testInput))
    setStep('result')
    showToast('Agent test completed')
    useNotificationStore.getState().addNotification({
      type: 'asset_created',
      title: 'Agent test completed',
      message: `Local validation passed for "${asset.title}".`,
    })
  }

  const handleOllamaTest = async () => {
    if (!selectedModel) return
    setOllamaTestLoading(true)
    setOllamaTestResult('')
    setOllamaTestError('')
    setOllamaTestTime(null)
    setOllamaTestModel(selectedModel)

    const start = Date.now()
    const built = buildOllamaPrompt(asset, testInput.trim(), '')

    try {
      const response = await generateWithOllama({
        ollamaUrl: ollama.baseUrl,
        model: selectedModel,
        prompt: built.prompt,
        system: built.system,
      })
      const elapsed = Date.now() - start
      setOllamaTestResult(response)
      setOllamaTestTime(elapsed)
      showToast(`Ollama test completed (${(elapsed / 1000).toFixed(1)}s)`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setOllamaTestError(msg)
    } finally {
      setOllamaTestLoading(false)
    }
  }

  const warnings = checklist.filter((c) => c.warn && !c.pass).length
  const failures = checklist.filter((c) => !c.pass && !c.warn).length
  const overallPassed = failures === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <FlaskConical size={13} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-main">Test Agent Input</h2>
              <p className="text-[10px] text-text-dim mt-0.5">{asset.title} · local validation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text-muted p-1 transition-colors rounded">
            <X size={15} />
          </button>
        </div>

        {step === 'input' ? (
          <div className="p-5 space-y-4 overflow-y-auto">
            <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-orange-500/5 border border-orange-500/15">
              <Info size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted leading-relaxed">
                Runs a local validation check against this agent&apos;s configuration. No external
                API is called. Validates input, variables, tools, and structure.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Test input <span className="text-danger">*</span>
              </label>
              <textarea
                value={testInput}
                onChange={(e) => { setTestInput(e.target.value); setError('') }}
                placeholder="Enter sample input text to test the agent configuration…"
                rows={4}
                autoFocus
                className="w-full px-3 py-2.5 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
              />
              {error && (
                <p className="text-xs text-danger mt-1.5">{error}</p>
              )}
            </div>

            {/* Variable preview */}
            {asset.variables && asset.variables.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                  Variables in scope
                </div>
                <div className="space-y-1">
                  {asset.variables.map((v) => (
                    <div key={v.name} className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono text-accent-blue">{v.name}</span>
                      <span className="text-text-dim">=</span>
                      <span className="text-text-muted">{v.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tool preview */}
            {asset.tools.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
                  Tools configured
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {asset.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 rounded text-[11px] bg-accent-blue/10 text-blue-400 border border-accent-blue/15"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleTest}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-orange-500/80 text-white text-sm font-medium hover:bg-orange-500 transition-colors"
              >
                <FlaskConical size={13} /> Run Test
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden">
            {/* Result banner */}
            <div
              className={cn(
                'flex items-center justify-between px-5 py-2.5 border-b flex-shrink-0',
                overallPassed
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-danger/5 border-danger/20'
              )}
            >
              <div className={cn('flex items-center gap-1.5 text-xs font-medium', overallPassed ? 'text-green-400' : 'text-danger')}>
                {overallPassed ? <Check size={13} /> : <AlertCircle size={13} />}
                {overallPassed ? 'Local test passed' : 'Test completed with issues'}
              </div>
              <button
                onClick={() => setStep('input')}
                className="text-[11px] text-text-dim hover:text-text-muted transition-colors"
              >
                ← Edit input
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Checklist */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 bg-surface-soft border-b border-border">
                  <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                    Validation Results
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {checklist.map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
                            item.pass
                              ? 'bg-green-500/15'
                              : item.warn
                              ? 'bg-yellow-500/15'
                              : 'bg-danger/15'
                          )}
                        >
                          {item.pass ? (
                            <Check size={10} className="text-green-400" />
                          ) : (
                            <AlertCircle size={10} className={item.warn ? 'text-yellow-400' : 'text-danger'} />
                          )}
                        </div>
                        <span className="text-xs text-text-main">{item.label}</span>
                      </div>
                      <span className={cn('text-[11px]', item.pass ? 'text-text-dim' : item.warn ? 'text-yellow-500/80' : 'text-danger/80')}>
                        {item.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="px-4 py-3 rounded-xl bg-surface-soft border border-border text-xs text-text-muted space-y-1">
                <div className="flex justify-between">
                  <span>Passed</span>
                  <span className="text-green-400 font-medium">{checklist.filter((c) => c.pass).length} / {checklist.length}</span>
                </div>
                {warnings > 0 && (
                  <div className="flex justify-between">
                    <span>Warnings (optional)</span>
                    <span className="text-yellow-400 font-medium">{warnings}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="font-medium text-text-main">Status</span>
                  <span className={cn('font-semibold', overallPassed ? 'text-green-400' : 'text-danger')}>
                    {overallPassed ? 'LOCAL TEST PASSED' : 'NEEDS ATTENTION'}
                  </span>
                </div>
              </div>

              {/* Optional Ollama test section */}
              {ollamaReady && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-surface-soft border-b border-border flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                      Test with Ollama
                    </span>
                    <span className="text-[10px] text-green-400">● Connected</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Model selector */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full appearance-none px-3 py-1.5 pr-7 text-xs rounded-lg bg-background border border-border text-text-main focus:outline-none focus:border-accent-blue/50"
                        >
                          {ollama.models.map((m) => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none" />
                      </div>
                      <button
                        onClick={handleOllamaTest}
                        disabled={ollamaTestLoading || !selectedModel}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/25 text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        {ollamaTestLoading
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Play size={11} />}
                        {ollamaTestLoading ? 'Running…' : 'Run with Ollama'}
                      </button>
                    </div>

                    {/* Result */}
                    {(ollamaTestResult || ollamaTestError) && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-text-dim">
                            {ollamaTestError
                              ? 'Error'
                              : `Response from ${ollamaTestModel}${ollamaTestTime ? ` · ${(ollamaTestTime / 1000).toFixed(1)}s` : ''}`}
                          </span>
                        </div>
                        <div className={cn(
                          'rounded-lg p-3 border text-xs leading-relaxed',
                          ollamaTestError
                            ? 'bg-danger/5 border-danger/20 text-danger'
                            : 'bg-background border-border text-text-muted font-mono whitespace-pre-wrap'
                        )}>
                          {ollamaTestError || ollamaTestResult}
                        </div>
                      </div>
                    )}

                    {!ollamaTestResult && !ollamaTestError && !ollamaTestLoading && (
                      <p className="text-[10px] text-text-dim">
                        Send the test input to Ollama to verify real model output.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!ollamaReady && (
                <p className="text-[10px] text-text-dim text-center leading-relaxed">
                  This is a local configuration check only.
                  Enable Ollama in Settings → Local AI for real model testing.
                </p>
              )}
            </div>

            <div className="px-5 py-4 border-t border-border flex-shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-surface-soft border border-border text-sm text-text-muted hover:text-text-main transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
