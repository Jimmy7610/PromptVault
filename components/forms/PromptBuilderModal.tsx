'use client'
import { useState, useMemo } from 'react'
import { X, Wand2, Copy, Check, BookmarkPlus } from 'lucide-react'
import { Asset } from '@/types'
import { extractPromptVariables, fillPromptVariables } from '@/lib/promptVariables'
import { copyToClipboard } from '@/lib/clipboard'
import { useAppStore } from '@/stores/useAppStore'
import { useCopyStore } from '@/stores/useCopyStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { cn } from '@/lib/utils'

interface PromptBuilderModalProps {
  asset: Asset
  /** The text to extract variables from (may be content, systemPrompt, etc.) */
  promptText: string
  onClose: () => void
}

export function PromptBuilderModal({ asset, promptText, onClose }: PromptBuilderModalProps) {
  const { addAsset, showToast } = useAppStore()
  const { recordCopy } = useCopyStore()
  const { t } = useI18n()

  const variables = useMemo(() => extractPromptVariables(promptText), [promptText])
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(variables.map((v) => [v, '']))
  )
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const generated = fillPromptVariables(promptText, values)

  const handleCopy = async () => {
    const ok = await copyToClipboard(generated)
    if (ok) {
      recordCopy(asset.id, t('promptBuilder.copyGenerated'))
      showToast(t('promptBuilder.generatedCopied'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = () => {
    const suffix = t('promptBuilder.savedTitle')
    const descTemplate = t('promptBuilder.savedDescription')
    addAsset({
      type: 'prompt',
      title: `${asset.title} ${suffix}`,
      description: descTemplate.replace('{title}', asset.title),
      content: generated,
      tags: [...(asset.tags ?? []), 'generated'],
      tools: asset.tools ?? [],
      isFavorite: false,
      status: 'active',
      visibility: asset.visibility ?? 'private',
      version: '1.0.0',
    })
    showToast(t('promptBuilder.generatedSaved'))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-surface border border-border shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-blue/15 flex items-center justify-center">
              <Wand2 size={14} className="text-accent-blue" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-main">{t('promptBuilder.title')}</h2>
              <p className="text-[11px] text-text-dim">{t('promptBuilder.description')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Variables */}
          <div>
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-3">
              {t('promptBuilder.detectedVariables')}
            </div>
            {variables.length === 0 ? (
              <p className="text-xs text-text-dim py-2">{t('promptBuilder.noVariables')}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {variables.map((name) => (
                  <div key={name}>
                    <label className="block text-[11px] font-mono text-accent-blue mb-1 truncate">
                      {`{${name}}`}
                    </label>
                    <input
                      type="text"
                      value={values[name] ?? ''}
                      onChange={(e) => setValues((prev) => ({ ...prev, [name]: e.target.value }))}
                      placeholder={t('promptBuilder.valuePlaceholder').replace('{name}', name)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Original prompt */}
          <div>
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              {t('promptBuilder.originalPrompt')}
            </div>
            <div className="text-xs text-text-dim leading-relaxed bg-background rounded-lg p-3 border border-border font-mono whitespace-pre-wrap max-h-28 overflow-y-auto">
              {promptText}
            </div>
          </div>

          {/* Generated output */}
          <div>
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-2">
              {t('promptBuilder.generatedPrompt')}
            </div>
            <div className="text-xs text-text-main leading-relaxed bg-background rounded-lg p-3 border border-accent-blue/20 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
              {variables.length === 0 ? (
                <span className="text-text-dim">{promptText}</span>
              ) : (
                generated.split(/(\{[a-zA-Z][a-zA-Z0-9_-]*\})/g).map((part, i) =>
                  /^\{[a-zA-Z]/.test(part) ? (
                    <span key={i} className="text-amber-400/80 bg-amber-400/8 rounded px-0.5">{part}</span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )
              )}
            </div>
            {variables.some((v) => !values[v]) && (
              <p className="text-[10px] text-amber-400/70 mt-1.5">
                {t('promptBuilder.unfilledVariables').replace('{name}', '{variable}')}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex-shrink-0 flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={variables.length === 0}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              'bg-accent-blue text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed',
              copied && 'bg-green-600 hover:bg-green-600'
            )}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {t('promptBuilder.copyGenerated')}
          </button>
          <button
            onClick={handleSave}
            disabled={variables.length === 0}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              'border border-border text-text-muted hover:text-text-main hover:border-border-soft hover:bg-surface-hover',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              saved && 'border-green-500/30 text-green-400 hover:text-green-400'
            )}
          >
            <BookmarkPlus size={12} />
            {t('promptBuilder.saveAsNew')}
          </button>
          <button
            onClick={onClose}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
          >
            {t('promptBuilder.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
