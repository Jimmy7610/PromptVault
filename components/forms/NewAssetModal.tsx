'use client'
import { useState } from 'react'
import {
  Bot,
  MessageSquare,
  Image,
  FileText,
  Code2,
  GitBranch,
  Layout,
  FileJson,
  StickyNote,
  X,
} from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { AssetType } from '@/types'
import { cn, assetTypeConfig } from '@/lib/utils'

const ASSET_TYPES: { type: AssetType; icon: React.ElementType; description: string }[] = [
  { type: 'agent', icon: Bot, description: 'AI agent with system prompt & tools' },
  { type: 'prompt', icon: MessageSquare, description: 'Image or text prompt template' },
  { type: 'markdown', icon: FileText, description: 'Markdown document or notes' },
  { type: 'image', icon: Image, description: 'Image or visual reference set' },
  { type: 'code', icon: Code2, description: 'Code snippet with syntax highlighting' },
  { type: 'workflow', icon: GitBranch, description: 'Multi-step process or automation' },
  { type: 'template', icon: Layout, description: 'Reusable structure or brief' },
  { type: 'json', icon: FileJson, description: 'JSON config or data file' },
  { type: 'note', icon: StickyNote, description: 'Quick note or research log' },
]

interface FormData {
  title: string
  description: string
  content: string
  systemPrompt: string
  instructions: string
  negativePrompt: string
  tools: string
  tags: string
  language: string
}

export function NewAssetModal() {
  const { isNewAssetModalOpen, closeNewAssetModal, newAssetType, addAsset, showToast, setSelectedAsset } =
    useAppStore()

  const [step, setStep] = useState<'type' | 'form'>(newAssetType ? 'form' : 'type')
  const [selectedType, setSelectedType] = useState<AssetType>(newAssetType ?? 'prompt')
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    content: '',
    systemPrompt: '',
    instructions: '',
    negativePrompt: '',
    tools: '',
    tags: '',
    language: '',
  })

  const handleClose = () => {
    closeNewAssetModal()
    setStep('type')
    setForm({
      title: '',
      description: '',
      content: '',
      systemPrompt: '',
      instructions: '',
      negativePrompt: '',
      tools: '',
      tags: '',
      language: '',
    })
  }

  const handleSelectType = (type: AssetType) => {
    setSelectedType(type)
    setStep('form')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const id = addAsset({
      type: selectedType,
      title: form.title.trim(),
      description: form.description.trim(),
      content: form.content.trim(),
      systemPrompt: form.systemPrompt.trim() || undefined,
      instructions: form.instructions.trim() || undefined,
      negativePrompt: form.negativePrompt.trim() || undefined,
      tools: form.tools ? form.tools.split(',').map((t) => t.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      language: form.language.trim() || undefined,
      isFavorite: false,
      status: 'active',
      visibility: 'private',
      version: '1.0.0',
    })

    showToast(`"${form.title}" created!`)
    setSelectedAsset(id)
    handleClose()
  }

  if (!isNewAssetModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-surface border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-text-main">
              {step === 'type' ? 'Create New Asset' : `New ${assetTypeConfig[selectedType].label}`}
            </h2>
            {step === 'form' && (
              <button
                onClick={() => setStep('type')}
                className="text-[11px] text-text-muted hover:text-text-main mt-0.5 transition-colors"
              >
                ← Change type
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-text-muted hover:bg-surface-hover transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Type selector */}
        {step === 'type' && (
          <div className="p-6">
            <p className="text-xs text-text-muted mb-4">Choose the type of asset you want to create.</p>
            <div className="grid grid-cols-3 gap-2">
              {ASSET_TYPES.map(({ type, icon: Icon, description }) => {
                const config = assetTypeConfig[type]
                return (
                  <button
                    key={type}
                    onClick={() => handleSelectType(type)}
                    className={cn(
                      'flex flex-col items-start gap-2 p-3 rounded-xl border border-border',
                      'hover:border-accent-blue/40 hover:bg-accent-blue/5',
                      'transition-all text-left group'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
                      <Icon size={15} className={config.iconColor} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-text-main">{config.label}</div>
                      <div className="text-[10px] text-text-dim leading-tight mt-0.5">{description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={`${assetTypeConfig[selectedType].label} name...`}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
                />
              </div>

              {/* Agent-specific fields */}
              {selectedType === 'agent' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">System Prompt</label>
                    <textarea
                      value={form.systemPrompt}
                      onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                      placeholder="You are a..."
                      rows={4}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Instructions</label>
                    <textarea
                      value={form.instructions}
                      onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                      placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                      rows={4}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
                    />
                  </div>
                </>
              )}

              {/* Content (prompts, markdown, etc.) */}
              {selectedType !== 'agent' && (
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">
                    {selectedType === 'prompt' ? 'Prompt' :
                     selectedType === 'code' ? 'Code' :
                     selectedType === 'markdown' ? 'Content' :
                     'Content'}
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder={
                      selectedType === 'prompt' ? 'Your prompt here...' :
                      selectedType === 'code' ? 'Your code here...' :
                      'Content...'
                    }
                    rows={6}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
                  />
                </div>
              )}

              {/* Negative prompt for image/prompt types */}
              {(selectedType === 'prompt' || selectedType === 'image') && (
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Negative Prompt</label>
                  <textarea
                    value={form.negativePrompt}
                    onChange={(e) => setForm({ ...form, negativePrompt: e.target.value })}
                    placeholder="Things to avoid..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
                  />
                </div>
              )}

              {/* Language for code */}
              {selectedType === 'code' && (
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main focus:outline-none focus:border-accent-blue/50 transition-all"
                  >
                    <option value="">Select language...</option>
                    {['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'SQL', 'JSON', 'Bash', 'PowerShell', 'C#', 'Other'].map(l => (
                      <option key={l} value={l.toLowerCase()} className="bg-surface">{l}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tools */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Tools <span className="text-text-dim font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tools}
                  onChange={(e) => setForm({ ...form, tools: e.target.value })}
                  placeholder="OpenAI, Midjourney, n8n..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Tags <span className="text-text-dim font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="marketing, content, social..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent-blue/50 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!form.title.trim()}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-accent-blue hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create {assetTypeConfig[selectedType].label}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
