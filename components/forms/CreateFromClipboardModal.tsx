'use client'
import { useState, useEffect, useRef } from 'react'
import {
  ClipboardPaste,
  X,
  Bot,
  MessageSquare,
  FileText,
  Code2,
  Layout,
  StickyNote,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { AssetType } from '@/types'
import { cn, assetTypeConfig } from '@/lib/utils'

// ── Heuristics ─────────────────────────────────────────────────────────────────

const SELECTABLE_TYPES: { type: AssetType; icon: React.ElementType }[] = [
  { type: 'prompt',   icon: MessageSquare },
  { type: 'agent',    icon: Bot },
  { type: 'markdown', icon: FileText },
  { type: 'code',     icon: Code2 },
  { type: 'template', icon: Layout },
  { type: 'note',     icon: StickyNote },
]

function detectType(text: string): AssetType {
  // Code: fenced code blocks or common code keywords at line start
  if (/```[\w]*\n/.test(text)) return 'code'
  if (/^\s*(function |const |let |var |def |class |import |export |#include|public class )/m.test(text)) return 'code'
  // Markdown: starts with heading or has ≥2 headings
  if ((text.match(/^#{1,3} .+/gm) ?? []).length >= 2) return 'markdown'
  if (/^# .+/.test(text.trimStart())) return 'markdown'
  // Agent: explicit agent/system-prompt vocabulary
  if (/\b(system prompt|you are a|you are an|as an ai|as an assistant|your role is|your task is|instructions:)\b/i.test(text)) return 'agent'
  return 'prompt'
}

function titleFromText(text: string): string {
  const firstLine = text.trim().split('\n')[0].trim()
  // Strip markdown heading markers and emphasis
  const clean = firstLine.replace(/^#+\s+/, '').replace(/[*_`~]/g, '').trim()
  const words = clean.split(/\s+/).slice(0, 8)
  const title = words.join(' ')
  return title.length > 64 ? title.slice(0, 61) + '…' : title
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CreateFromClipboardModal() {
  const { isClipboardModalOpen, closeClipboardModal, addAsset, showToast, setSelectedAsset } =
    useAppStore()
  const { t } = useI18n()

  const [clipState, setClipState] = useState<'loading' | 'ready' | 'empty' | 'denied'>('loading')
  const [clipText, setClipText] = useState('')
  const [title, setTitle] = useState('')
  const [selectedType, setSelectedType] = useState<AssetType>('prompt')
  const [tags, setTags] = useState('clipboard')
  const titleRef = useRef<HTMLInputElement>(null)

  // Read clipboard whenever the modal opens
  useEffect(() => {
    if (!isClipboardModalOpen) return

    setClipState('loading')
    setClipText('')
    setTitle('')
    setTags('clipboard')

    navigator.clipboard.readText().then((text) => {
      const trimmed = text.trim()
      if (!trimmed) {
        setClipState('empty')
        showToast(t('clipboard.emptyToast'), 'info')
        return
      }
      setClipText(trimmed)
      setTitle(titleFromText(trimmed))
      setSelectedType(detectType(trimmed))
      setClipState('ready')
      setTimeout(() => titleRef.current?.select(), 60)
    }).catch(() => {
      setClipState('denied')
    })
  }, [isClipboardModalOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !clipText) return

    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)

    // Place clipboard text in the right field depending on type
    const isAgent = selectedType === 'agent'
    const id = addAsset({
      type: selectedType,
      title: title.trim(),
      description: '',
      content: isAgent ? '' : clipText,
      systemPrompt: isAgent ? clipText : undefined,
      tools: [],
      tags: tagList,
      isFavorite: false,
      status: 'active',
      visibility: 'private',
      version: '1.0.0',
    })

    showToast(t('clipboard.created'))
    setSelectedAsset(id)
    closeClipboardModal()
  }

  if (!isClipboardModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeClipboardModal} />

      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-blue/10 flex items-center justify-center">
              <ClipboardPaste size={14} className="text-accent-blue" />
            </div>
            <h2 className="text-sm font-semibold text-text-main">{t('clipboard.title')}</h2>
          </div>
          <button
            onClick={closeClipboardModal}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Loading */}
        {clipState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 size={20} className="text-accent-blue animate-spin" />
            <p className="text-xs text-text-dim">{t('clipboard.reading')}</p>
          </div>
        )}

        {/* Empty clipboard */}
        {clipState === 'empty' && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 px-6 text-center">
            <ClipboardPaste size={28} className="text-text-dim" />
            <p className="text-sm text-text-muted">{t('clipboard.empty')}</p>
            <p className="text-xs text-text-dim">{t('clipboard.emptyDesc')}</p>
            <button
              onClick={closeClipboardModal}
              className="mt-2 px-4 py-2 text-sm text-text-muted border border-border rounded-lg hover:text-text-main transition-colors"
            >
              {t('clipboard.close')}
            </button>
          </div>
        )}

        {/* Permission denied */}
        {clipState === 'denied' && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 px-6 text-center">
            <AlertTriangle size={24} className="text-amber-400" />
            <p className="text-sm text-text-muted">{t('clipboard.denied')}</p>
            <p className="text-xs text-text-dim leading-relaxed max-w-xs">
              {t('clipboard.deniedDesc')}
            </p>
            <button
              onClick={closeClipboardModal}
              className="mt-2 px-4 py-2 text-sm text-text-muted border border-border rounded-lg hover:text-text-main transition-colors"
            >
              {t('clipboard.close')}
            </button>
          </div>
        )}

        {/* Ready — show form */}
        {clipState === 'ready' && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                {t('clipboard.titleLabel')} <span className="text-danger">*</span>
              </label>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('clipboard.titlePlaceholder')}
                required
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
              />
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">{t('clipboard.typeLabel')}</label>
              <div className="flex flex-wrap gap-1.5">
                {SELECTABLE_TYPES.map(({ type, icon: Icon }) => {
                  const cfg = assetTypeConfig[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all',
                        selectedType === type
                          ? 'bg-accent-blue/15 border-accent-blue/40 text-accent-blue'
                          : 'bg-background border-border text-text-muted hover:border-border-soft hover:text-text-main'
                      )}
                    >
                      <Icon size={11} />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                {t('clipboard.tagsLabel')} <span className="text-text-dim font-normal">{t('clipboard.tagsNote')}</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="clipboard, prompt, marketing…"
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
              />
            </div>

            {/* Content preview */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                {selectedType === 'agent' ? t('editModal.systemPrompt') : t('editModal.content')}{' '}
                <span className="text-text-dim font-normal">{t('clipboard.fromClipboard')}</span>
              </label>
              <textarea
                value={clipText}
                onChange={(e) => setClipText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={closeClipboardModal}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
              >
                {t('clipboard.cancel')}
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-accent-blue hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ClipboardPaste size={13} />
                {t('clipboard.save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
