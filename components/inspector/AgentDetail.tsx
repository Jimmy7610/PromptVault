'use client'
import { useState } from 'react'
import {
  Play,
  FlaskConical,
  Copy,
  FileText,
  FileJson,
  Image,
  Variable,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  Calendar,
} from 'lucide-react'
import { Asset } from '@/types'
import { CopyButton } from '@/components/ui/CopyButton'
import { AssetStatusRow } from './AssetStatusRow'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { assetToMarkdown } from '@/lib/export'
import { RunAgentModal } from '@/components/agent/RunAgentModal'
import { TestAgentModal } from '@/components/agent/TestAgentModal'

type Tab = 'overview' | 'activity' | 'versions' | 'notes'

const FILE_ICONS: Record<string, React.ElementType> = {
  md: FileText,
  json: FileJson,
  png: Image,
  jpg: Image,
  pdf: FileText,
  txt: FileText,
  other: FileText,
}

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

interface AgentDetailProps {
  asset: Asset
}

export function AgentDetail({ asset }: AgentDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [runModalOpen, setRunModalOpen] = useState(false)
  const [testModalOpen, setTestModalOpen] = useState(false)
  const { showToast, toggleFavorite } = useAppStore()
  const { t } = useI18n()

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: t('inspector.tabOverview') },
    { id: 'activity', label: t('inspector.tabActivity') },
    { id: 'versions', label: t('inspector.tabVersions') },
    { id: 'notes', label: t('inspector.tabNotes') },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-0 flex-shrink-0">
        {/* Type + version badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25">
            Agent
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

        {/* Title */}
        <h2 className="text-base font-bold text-text-main mb-1 leading-tight">{asset.title}</h2>
        <p className="text-xs text-text-muted leading-relaxed mb-1">{asset.description}</p>
        <AssetStatusRow asset={asset} />

        {/* Tabs */}
        <div className="flex border-b border-border -mx-4 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-2 text-xs font-medium border-b-2 transition-all',
                activeTab === tab.id
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-text-muted hover:text-text-main'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <>
            {/* System Prompt */}
            {asset.systemPrompt && (
              <Section
                title={t('inspector.systemPrompt')}
                action={
                  <CopyButton
                    text={asset.systemPrompt}
                    label="System Prompt"
                    assetId={asset.id}
                    size="sm"
                    variant="icon"
                  />
                }
              >
                <div className="text-xs text-text-muted leading-relaxed bg-background rounded-lg p-3 border border-border font-mono whitespace-pre-wrap">
                  {asset.systemPrompt}
                </div>
              </Section>
            )}

            {/* Instructions */}
            {asset.instructions && (
              <Section
                title={t('inspector.instructions')}
                action={
                  <CopyButton
                    text={asset.instructions}
                    label="Instructions"
                    assetId={asset.id}
                    size="sm"
                    variant="icon"
                  />
                }
              >
                <div className="text-xs text-text-muted leading-relaxed space-y-1.5">
                  {asset.instructions.split('\n').map((line, i) => (
                    <div key={i} className={cn(line.match(/^\d+\./) ? 'flex gap-2' : '')}>
                      {line.match(/^\d+\./) ? (
                        <>
                          <span className="text-accent-blue font-medium flex-shrink-0 w-4">
                            {line.match(/^(\d+)\./)?.[1]}.
                          </span>
                          <span>{line.replace(/^\d+\.\s*/, '')}</span>
                        </>
                      ) : (
                        <span>{line}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Linked Files */}
            {asset.linkedFiles && asset.linkedFiles.length > 0 && (
              <Section title={t('inspector.linkedFiles')}>
                <div className="space-y-1.5">
                  {asset.linkedFiles.map((file) => {
                    const FileIcon = FILE_ICONS[file.type] ?? FileText
                    return (
                      <div
                        key={file.name}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-background border border-border hover:border-border-soft transition-colors group"
                      >
                        <FileIcon size={13} className="text-text-muted flex-shrink-0" />
                        <span className="text-xs text-text-main flex-1 truncate">{file.name}</span>
                        {file.size && (
                          <span className="text-[10px] text-text-dim">{file.size}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* Example Output */}
            {asset.exampleOutput && (
              <Section
                title={t('inspector.exampleOutput')}
                action={
                  <CopyButton
                    text={asset.exampleOutput}
                    label="Example Output"
                    size="sm"
                    variant="icon"
                  />
                }
              >
                <div className="text-xs text-text-muted leading-relaxed bg-background rounded-lg p-3 border border-border whitespace-pre-wrap">
                  {asset.exampleOutput}
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

            {/* Metadata */}
            <Section title={t('inspector.metadata')} defaultOpen={false}>
              <div className="space-y-2">
                {[
                  {
                    icon: Calendar,
                    label: 'Created',
                    value: formatDate(asset.createdAt),
                  },
                  {
                    icon: Clock,
                    label: 'Updated',
                    value: formatRelativeTime(asset.updatedAt),
                  },
                  {
                    icon: Clock,
                    label: 'Last Used',
                    value: asset.lastUsedAt ? formatRelativeTime(asset.lastUsedAt) : 'Never',
                  },
                  { icon: Hash, label: 'Usage Count', value: asset.usageCount.toString() },
                  { icon: Copy, label: 'Copy Count', value: asset.copyCount.toString() },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-dim">
                      <Icon size={11} />
                      {label}
                    </div>
                    <span className="text-[11px] text-text-muted">{value}</span>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {activeTab === 'notes' && (
          <div className="px-4 py-4">
            {asset.notes ? (
              <div className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
                {asset.notes}
              </div>
            ) : (
              <div className="text-xs text-text-dim text-center py-8">No notes yet</div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="px-4 py-4">
            <div className="space-y-3">
              {[
                { action: 'Copied system prompt', time: '2h ago', icon: Copy },
                { action: 'Updated instructions', time: '1d ago', icon: FileText },
                { action: 'Used in session', time: '2d ago', icon: Play },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-surface-soft border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={11} className="text-text-dim" />
                    </div>
                    <div>
                      <div className="text-xs text-text-main">{item.action}</div>
                      <div className="text-[10px] text-text-dim">{item.time}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="px-4 py-4">
            <div className="space-y-2">
              {[
                { version: `v${asset.version}`, date: formatRelativeTime(asset.updatedAt), current: true },
                { version: 'v1.3.1', date: '2 weeks ago', current: false },
                { version: 'v1.2.0', date: '1 month ago', current: false },
              ].map((v) => (
                <div
                  key={v.version}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg border transition-colors',
                    v.current
                      ? 'bg-accent-blue/5 border-accent-blue/20'
                      : 'bg-background border-border hover:border-border-soft'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-mono', v.current ? 'text-accent-blue' : 'text-text-muted')}>
                      {v.version}
                    </span>
                    {v.current && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-blue/15 text-accent-blue font-medium">
                        current
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-dim">{v.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-surface">
        <div className="text-[10px] text-text-dim uppercase tracking-wider font-semibold mb-2">
          {t('inspector.quickActions')}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRunModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue text-white text-xs font-medium hover:bg-blue-500 transition-colors"
          >
            <Play size={11} /> {t('inspector.runAgent')}
          </button>
          <button
            onClick={() => setTestModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-soft border border-border text-text-muted hover:text-text-main text-xs transition-colors"
          >
            <FlaskConical size={11} /> {t('inspector.testAgent')}
          </button>
          <CopyButton
            text={assetToMarkdown(asset)}
            label={t('inspector.copyAllAsset')}
            assetId={asset.id}
            toastMessage={t('inspector.fullAssetCopied')}
          />
        </div>
      </div>

      <RunAgentModal
        open={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        asset={asset}
      />
      <TestAgentModal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        asset={asset}
      />
    </div>
  )
}
