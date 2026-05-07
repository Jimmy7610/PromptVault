'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Settings2, Variable } from 'lucide-react'
import { Asset } from '@/types'
import { CopyButton } from '@/components/ui/CopyButton'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'

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
      </div>

      {/* Content sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Prompt */}
        <Section
          title="Prompt"
          action={
            <CopyButton text={asset.content} label="Prompt" assetId={asset.id} size="sm" variant="icon" />
          }
        >
          <div className="text-xs text-text-muted leading-relaxed bg-background rounded-lg p-3 border border-border font-mono whitespace-pre-wrap">
            {asset.content}
          </div>
        </Section>

        {/* Negative Prompt */}
        {asset.negativePrompt && (
          <Section
            title="Negative Prompt"
            action={
              <CopyButton
                text={asset.negativePrompt}
                label="Negative Prompt"
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
          <Section title="Settings" action={<Settings2 size={12} className="text-text-dim" />}>
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
          <Section title="Variables">
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
          <Section title="Notes" defaultOpen={false}>
            <div className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
              {asset.notes}
            </div>
          </Section>
        )}

        {/* Metadata */}
        <Section title="Metadata" defaultOpen={false}>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-dim">Created</span>
              <span className="text-text-muted">{formatDate(asset.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Updated</span>
              <span className="text-text-muted">{formatRelativeTime(asset.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Copies</span>
              <span className="text-text-muted">{asset.copyCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dim">Usage</span>
              <span className="text-text-muted">{asset.usageCount}</span>
            </div>
          </div>
        </Section>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-surface">
        <div className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-2">
          Quick Actions
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={asset.content} label="Copy Prompt" assetId={asset.id} />
          {asset.negativePrompt && (
            <CopyButton text={asset.negativePrompt} label="Copy Negative" />
          )}
          <CopyButton
            text={[asset.content, asset.negativePrompt && `\n\nNegative: ${asset.negativePrompt}`].filter(Boolean).join('')}
            label="Copy All"
            toastMessage="Everything copied!"
          />
        </div>
      </div>
    </div>
  )
}
