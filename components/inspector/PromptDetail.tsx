'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Settings2, Variable, Wand2 } from 'lucide-react'
import { Asset } from '@/types'
import { CopyButton } from '@/components/ui/CopyButton'
import { AssetStatusRow } from './AssetStatusRow'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/useI18n'
import { hasPromptVariables } from '@/lib/promptVariables'
import { PromptBuilderModal } from '@/components/forms/PromptBuilderModal'

interface SectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  action?: React.ReactNode
}

function Section({ title, children, defaultOpen = true, action }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 text-left hover:text-text-main transition-colors"
        >
          {title}
        </button>
        <div className="flex items-center gap-2">
          {action}
          <button onClick={() => setOpen(!open)} className="hover:text-text-main transition-colors">
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

interface PromptDetailProps {
  asset: Asset
}

export function PromptDetail({ asset }: PromptDetailProps) {
  const { t } = useI18n()
  const [builderOpen, setBuilderOpen] = useState(false)
  const showBuilder = hasPromptVariables(asset.content)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
            Prompt
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-soft text-text-dim border border-border">
            v{asset.version}
          </span>
          {asset.tools.map((tool) => (
            <span
              key={tool}
              className="px-2 py-0.5 rounded-full text-[10px] bg-accent-blue/10 text-blue-400 border border-accent-blue/15"
            >
              {tool}
            </span>
          ))}
        </div>
        <h2 className="text-base font-bold text-text-main mb-1">{asset.title}</h2>
        <p className="text-xs text-text-muted leading-relaxed">{asset.description}</p>
        <AssetStatusRow asset={asset} />
      </div>

      {/* Content sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Prompt */}
        <Section
          title={t('inspector.prompt')}
          action={
            <CopyButton text={asset.content} label={t('inspector.prompt')} assetId={asset.id} size="sm" variant="icon" />
          }
        >
          <div className="text-xs text-text-muted leading-relaxed bg-background rounded-lg p-3 border border-border font-mono whitespace-pre-wrap">
            {asset.content}
          </div>
        </Section>

        {/* Negative Prompt */}
        {asset.negativePrompt && (
          <Section
            title={t('inspector.negativePrompt')}
            action={
              <CopyButton
                text={asset.negativePrompt}
                label={t('inspector.negativePrompt')}
                size="sm"
                variant="icon"
              />
            }
          >
            <div className="text-xs text-text-muted leading-relaxed bg-background rounded-lg p-3 border border-danger/15 font-mono whitespace-pre-wrap">
              {asset.negativePrompt}
            </div>
          </Section>
        )}

        {/* Settings */}
        {asset.settings && Object.keys(asset.settings).length > 0 && (
          <Section title={t('inspector.settings')} action={<Settings2 size={12} className="text-text-dim" />}>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(asset.settings).map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col px-2.5 py-2 rounded-lg bg-background border border-border"
                >
                  <span className="text-[9px] text-text-dim uppercase tracking-wide mb-0.5">
                    {key}
                  </span>
                  <span className="text-xs text-text-muted font-mono">{value}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Variables */}
        {asset.variables && asset.variables.length > 0 && (
          <Section title={t('inspector.variables')}>
            <div className="space-y-1.5">
              {asset.variables.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-background border border-border"
                >
                  <Variable size={11} className="text-text-dim flex-shrink-0" />
                  <span className="text-[11px] font-mono text-accent-blue">{v.name}</span>
                  <span className="text-text-dim mx-0.5">=</span>
                  <span className="text-[11px] text-text-muted truncate flex-1">{v.value}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Notes */}
        {asset.notes && (
          <Section title={t('inspector.notes')} defaultOpen={false}>
            <div className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
              {asset.notes}
            </div>
          </Section>
        )}

        {/* Metadata */}
        <Section title={t('inspector.metadata')} defaultOpen={false}>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-dim">{t('inspector.created')}</span>
              <span className="text-text-muted">{formatDate(asset.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">{t('inspector.updated')}</span>
              <span className="text-text-muted">{formatRelativeTime(asset.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">{t('inspector.copies')}</span>
              <span className="text-text-muted">{asset.copyCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">{t('inspector.usage')}</span>
              <span className="text-text-muted">{asset.usageCount}</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-surface">
        <div className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-2">
          {t('inspector.quickActions')}
        </div>
        <div className="flex flex-wrap gap-2">
          {showBuilder && (
            <button
              onClick={() => setBuilderOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue text-white text-xs font-medium hover:bg-blue-500 transition-colors"
            >
              <Wand2 size={11} /> {t('promptBuilder.buildPrompt')}
            </button>
          )}
          <CopyButton text={asset.content} label={t('inspector.copyPrompt')} assetId={asset.id} />
          {asset.negativePrompt && (
            <CopyButton text={asset.negativePrompt} label={t('inspector.copyNegative')} />
          )}
          <CopyButton
            text={[asset.content, asset.negativePrompt && `\n\nNegative: ${asset.negativePrompt}`].filter(Boolean).join('')}
            label={t('inspector.copyAll')}
          />
        </div>
      </div>

      {builderOpen && (
        <PromptBuilderModal
          asset={asset}
          promptText={asset.content}
          onClose={() => setBuilderOpen(false)}
        />
      )}
    </div>
  )
}
