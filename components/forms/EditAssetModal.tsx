'use client'
import { useState, useRef } from 'react'
import { X, Plus, Trash2, Wand2, Check } from 'lucide-react'
import { Asset, Variable } from '@/types'
import { useAppStore } from '@/stores/useAppStore'
import { useVersionStore } from '@/stores/useVersionStore'
import { useCollectionStore } from '@/stores/useCollectionStore'
import { useI18n } from '@/lib/i18n/useI18n'
import { cn, assetTypeConfig } from '@/lib/utils'
import { hasPromptVariables } from '@/lib/promptVariables'

interface FormState {
  title: string
  description: string
  content: string
  systemPrompt: string
  instructions: string
  negativePrompt: string
  exampleOutput: string
  tools: string
  tags: string
  language: string
  notes: string
  version: string
  variables: Variable[]
}

function assetToForm(asset: Asset): FormState {
  return {
    title: asset.title,
    description: asset.description ?? '',
    content: asset.content ?? '',
    systemPrompt: asset.systemPrompt ?? '',
    instructions: asset.instructions ?? '',
    negativePrompt: asset.negativePrompt ?? '',
    exampleOutput: asset.exampleOutput ?? '',
    tools: (asset.tools ?? []).join(', '),
    tags: (asset.tags ?? []).join(', '),
    language: asset.language ?? '',
    notes: asset.notes ?? '',
    version: asset.version ?? '1.0.0',
    variables: asset.variables ? asset.variables.map((v) => ({ ...v })) : [],
  }
}

interface EditAssetModalProps {
  asset: Asset
  onClose: () => void
}

const INPUT_CLS =
  'w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all'
const MONO_CLS =
  'w-full px-3 py-2 text-xs font-mono rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all'
const LABEL_CLS = 'block text-xs font-medium text-text-muted mb-1.5'

export function EditAssetModal({ asset, onClose }: EditAssetModalProps) {
  const { updateAsset, showToast } = useAppStore()
  const { saveVersion } = useVersionStore()
  const { collections, setAssetCollections } = useCollectionStore()
  const { t } = useI18n()
  const initialRef = useRef<FormState>(assetToForm(asset))
  const [form, setForm] = useState<FormState>(initialRef.current)
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialRef.current)

  const set = (key: keyof FormState, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const handleClose = () => {
    if (isDirty && !confirm(t('common.unsavedChanges') + '?')) return
    onClose()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setIsSaving(true)

    // Snapshot current state BEFORE applying changes
    saveVersion(asset, 'edit')

    const updates: Partial<Asset> = {
      title: form.title.trim(),
      description: form.description.trim(),
      content: form.content.trim(),
      tools: form.tools ? form.tools.split(',').map((s) => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      notes: form.notes.trim() || undefined,
      version: form.version.trim() || '1.0.0',
      variables: form.variables.filter((v) => v.name.trim()),
    }

    if (asset.type === 'agent') {
      updates.systemPrompt = form.systemPrompt.trim() || undefined
      updates.instructions = form.instructions.trim() || undefined
      updates.exampleOutput = form.exampleOutput.trim() || undefined
    }
    if (asset.type === 'prompt' || asset.type === 'image') {
      updates.negativePrompt = form.negativePrompt.trim() || undefined
    }
    if (asset.type === 'code') {
      updates.language = form.language || undefined
    }

    updateAsset(asset.id, updates)

    try {
      const updated = useAppStore.getState().assets.find((a) => a.id === asset.id)
      if (updated) {
        const { updateVaultAsset } = await import('@/lib/vaultClient')
        await updateVaultAsset({ ...updated, ...updates, updatedAt: new Date().toISOString() })
      }
    } catch {
      // vault sync is optional
    }

    // Notification
    import('@/stores/useNotificationStore').then(({ useNotificationStore }) => {
      useNotificationStore.getState().addNotification({
        type: 'asset_created',
        title: 'Asset updated',
        message: `"${form.title.trim()}" was saved.`,
      })
    })

    showToast(`"${form.title.trim()}" updated`)
    setIsSaving(false)
    onClose()
  }

  // Variables helpers
  const addVariable = () =>
    setForm((prev) => ({
      ...prev,
      variables: [...prev.variables, { name: '', value: '', description: '' }],
    }))
  const updateVar = (i: number, field: keyof Variable, val: string) =>
    setForm((prev) => ({
      ...prev,
      variables: prev.variables.map((v, idx) => (idx === i ? { ...v, [field]: val } : v)),
    }))
  const removeVar = (i: number) =>
    setForm((prev) => ({ ...prev, variables: prev.variables.filter((_, idx) => idx !== i) }))

  const config = assetTypeConfig[asset.type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-text-main">{t('editModal.title')}</h2>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', config.badgeClass)}>
                  {config.label}
                </span>
              </div>
              <p className="text-[11px] text-text-dim mt-0.5">{t('editModal.typeLockedHint')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-4 flex-1">

            {/* ── Basic Info ── */}
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider pb-1 border-b border-border">
              {t('editModal.basicInfo')}
            </div>

            <div>
              <label className={LABEL_CLS}>
                {t('editModal.titleField')} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                required
                autoFocus
                placeholder="Asset name..."
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>{t('editModal.description')}</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={2}
                placeholder="Brief description..."
                className={cn(INPUT_CLS, 'resize-none')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>
                  {t('editModal.tools')} <span className="text-text-dim font-normal">({t('editModal.commaSeparated')})</span>
                </label>
                <input
                  type="text"
                  value={form.tools}
                  onChange={(e) => set('tools', e.target.value)}
                  placeholder="OpenAI, Midjourney..."
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>
                  {t('editModal.tags')} <span className="text-text-dim font-normal">({t('editModal.commaSeparated')})</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  placeholder="marketing, social..."
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* ── Content ── */}
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider pt-2 pb-1 border-b border-border">
              {t('editModal.content')}
            </div>

            {/* Agent: system prompt + instructions + example output */}
            {asset.type === 'agent' && (
              <>
                <div>
                  <label className={LABEL_CLS}>{t('editModal.systemPrompt')}</label>
                  <textarea
                    value={form.systemPrompt}
                    onChange={(e) => set('systemPrompt', e.target.value)}
                    rows={5}
                    placeholder="You are a..."
                    className={cn(MONO_CLS, 'resize-none')}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>{t('editModal.instructions')}</label>
                  <textarea
                    value={form.instructions}
                    onChange={(e) => set('instructions', e.target.value)}
                    rows={4}
                    placeholder={'1. Step one\n2. Step two\n3. Step three'}
                    className={cn(MONO_CLS, 'resize-none')}
                  />
                </div>
                <div>
                  <label className={LABEL_CLS}>{t('editModal.exampleOutput')}</label>
                  <textarea
                    value={form.exampleOutput}
                    onChange={(e) => set('exampleOutput', e.target.value)}
                    rows={3}
                    placeholder="Expected response example..."
                    className={cn(MONO_CLS, 'resize-none')}
                  />
                </div>
              </>
            )}

            {/* Non-agent: main content textarea */}
            {asset.type !== 'agent' && (
              <div>
                <label className={LABEL_CLS}>
                  {asset.type === 'prompt'
                    ? t('editModal.prompt')
                    : asset.type === 'image'
                    ? t('editModal.generationPrompt')
                    : asset.type === 'code'
                    ? t('editModal.code')
                    : t('editModal.content')}
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => set('content', e.target.value)}
                  rows={8}
                  placeholder={
                    asset.type === 'image'
                      ? 'Describe the image to generate...'
                      : asset.type === 'prompt'
                      ? 'Your prompt here...'
                      : 'Content...'
                  }
                  className={cn(MONO_CLS, 'resize-none')}
                />
              </div>
            )}

            {/* Variable hint */}
            {['prompt', 'image', 'agent'].includes(asset.type) &&
              hasPromptVariables(
                asset.type === 'agent'
                  ? (form.systemPrompt || form.instructions)
                  : form.content
              ) && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-accent-blue/5 border border-accent-blue/15 -mt-1">
                <Wand2 size={11} className="text-accent-blue flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-dim leading-snug">{t('editModal.variableHint')}</p>
              </div>
            )}

            {/* Negative Prompt */}
            {(asset.type === 'prompt' || asset.type === 'image') && (
              <div>
                <label className={LABEL_CLS}>{t('editModal.negativePrompt')}</label>
                <textarea
                  value={form.negativePrompt}
                  onChange={(e) => set('negativePrompt', e.target.value)}
                  rows={2}
                  placeholder="Things to avoid..."
                  className={cn(MONO_CLS, 'resize-none')}
                />
              </div>
            )}

            {/* Code language */}
            {asset.type === 'code' && (
              <div>
                <label className={LABEL_CLS}>{t('editModal.language')}</label>
                <select
                  value={form.language}
                  onChange={(e) => set('language', e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="">Select language...</option>
                  {[
                    'JavaScript',
                    'TypeScript',
                    'Python',
                    'HTML',
                    'CSS',
                    'SQL',
                    'JSON',
                    'Bash',
                    'PowerShell',
                    'C#',
                    'Other',
                  ].map((l) => (
                    <option key={l} value={l.toLowerCase()} className="bg-surface">
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ── Advanced ── */}
            <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider pt-2 pb-1 border-b border-border">
              {t('editModal.advanced')}
            </div>

            {/* Variables */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={cn(LABEL_CLS, 'mb-0')}>{t('editModal.variables')}</label>
                <button
                  type="button"
                  onClick={addVariable}
                  className="flex items-center gap-1 text-[11px] text-accent-blue hover:text-blue-400 transition-colors"
                >
                  <Plus size={11} />
                  {t('editModal.addVariable')}
                </button>
              </div>
              {form.variables.length === 0 ? (
                <p className="text-xs text-text-dim py-1.5">No variables yet.</p>
              ) : (
                <div className="space-y-2">
                  {form.variables.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={v.name}
                        onChange={(e) => updateVar(i, 'name', e.target.value)}
                        placeholder="name"
                        className="flex-1 px-2 py-1.5 text-xs font-mono rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                      />
                      <input
                        value={v.value}
                        onChange={(e) => updateVar(i, 'value', e.target.value)}
                        placeholder="value"
                        className="flex-[2] px-2 py-1.5 text-xs rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeVar(i)}
                        className="w-6 h-6 flex items-center justify-center text-text-dim hover:text-danger transition-colors flex-shrink-0"
                        aria-label="Remove variable"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Collections */}
            {collections.length > 0 && (
              <div>
                <label className={LABEL_CLS}>{t('collections.inCollections')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {collections.map((col) => {
                    const isMember = col.assetIds.includes(asset.id)
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          const current = collections
                            .filter((c) => c.assetIds.includes(asset.id))
                            .map((c) => c.id)
                          const next = isMember
                            ? current.filter((id) => id !== col.id)
                            : [...current, col.id]
                          setAssetCollections(asset.id, next)
                        }}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all',
                          isMember
                            ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'
                            : 'bg-surface border-border text-text-dim hover:text-text-muted hover:border-border-soft'
                        )}
                      >
                        {isMember && <Check size={10} />}
                        {col.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className={LABEL_CLS}>{t('editModal.notes')}</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={2}
                placeholder="Private notes about this asset..."
                className={cn(INPUT_CLS, 'resize-none')}
              />
            </div>

            <div>
              <label className={LABEL_CLS}>{t('editModal.version')}</label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => set('version', e.target.value)}
                placeholder="1.0.0"
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0 bg-surface rounded-b-2xl">
            <span className={cn('text-xs', isDirty ? 'text-amber-400' : 'text-text-dim')}>
              {isDirty ? t('common.unsavedChanges') : t('common.noChanges')}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={!form.title.trim() || isSaving}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-accent-blue hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? t('editModal.saving') : t('editModal.saveChanges')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
