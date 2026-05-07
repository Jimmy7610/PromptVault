'use client'
import { useState } from 'react'
import {
  X,
  Bot,
  Sparkles,
  FileText,
  Code2,
  GitBranch,
  Layout,
  Image,
  HardDrive,
  Cpu,
  Shield,
  Trash2,
  Lightbulb,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

type GuideSection =
  | 'what'
  | 'assets'
  | 'demo'
  | 'vault'
  | 'trash'
  | 'ollama'
  | 'privacy'
  | 'workflow'

const SECTIONS: { id: GuideSection; label: string; icon: React.ElementType }[] = [
  { id: 'what',     label: 'What is PromptVault?',  icon: Lightbulb },
  { id: 'assets',   label: 'What you can store',    icon: Sparkles },
  { id: 'demo',     label: 'Demo assets',           icon: FileText },
  { id: 'vault',    label: 'Local Vault storage',   icon: HardDrive },
  { id: 'trash',    label: 'Trash & delete',        icon: Trash2 },
  { id: 'ollama',   label: 'Ollama / Local AI',     icon: Cpu },
  { id: 'privacy',  label: 'Privacy & local-first', icon: Shield },
  { id: 'workflow', label: 'Recommended workflow',  icon: GitBranch },
]

function GuideCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg bg-accent-blue/15 flex items-center justify-center flex-shrink-0">
          <Icon size={14} className="text-accent-blue" />
        </div>
        <h3 className="text-sm font-semibold text-text-main">{title}</h3>
      </div>
      <div className="text-xs text-text-muted leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

function AssetTypeRow({ icon: Icon, label, desc }: { icon: React.ElementType; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <div className="w-5 h-5 rounded bg-surface-soft border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={11} className="text-text-muted" />
      </div>
      <div>
        <span className="text-xs font-medium text-text-main">{label}</span>
        <span className="text-xs text-text-dim"> — {desc}</span>
      </div>
    </div>
  )
}

function WorkflowStep({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className="w-5 h-5 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
        {n}
      </div>
      <p className="text-xs text-text-muted">{text}</p>
    </div>
  )
}

export function AppGuideModal({ open, onClose }: Props) {
  const [section, setSection] = useState<GuideSection>('what')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center">
              <Lightbulb size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-main">App Guide</h2>
              <p className="text-[10px] text-text-dim">Everything you need to know about PromptVault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-dim hover:text-text-main hover:bg-surface-hover transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Section nav */}
          <div className="w-44 flex-shrink-0 border-r border-border p-3 overflow-y-auto">
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => {
                const Icon = s.icon
                return (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left',
                      section === s.id
                        ? 'bg-accent-blue/15 text-accent-blue font-medium'
                        : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
                    )}
                  >
                    <Icon size={12} className="flex-shrink-0" />
                    {s.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">

            {section === 'what' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">What is PromptVault?</h2>
                <p className="text-xs text-text-dim mb-4">Your personal AI workspace — no cloud required.</p>

                <GuideCard icon={Sparkles} title="A personal AI workspace">
                  <p>PromptVault is a local-first app for organizing everything you use with AI tools — prompts, agents, notes, code snippets, workflows, image references, and templates.</p>
                  <p>Think of it as your personal AI library: a place to save your best work, reuse it instantly, and keep it organized so you can find exactly what you need when you need it.</p>
                </GuideCard>

                <GuideCard icon={HardDrive} title="Local-first by design">
                  <p>Everything you create lives on your own computer. PromptVault does not send your data to any cloud service, does not require an account on a third-party platform, and does not need an internet connection to work.</p>
                  <p>Your prompts and agents are yours — stored as real files in a <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> folder on your machine (once you enable Vault Storage in Settings).</p>
                </GuideCard>

                <GuideCard icon={Lightbulb} title="Who is it for?">
                  <p>PromptVault is useful for:</p>
                  <ul className="space-y-1 mt-1 ml-2">
                    {[
                      'Prompt engineers who want to version and reuse their best prompts',
                      'AI hobbyists building a personal library of agents and instructions',
                      'Developers who want to keep code snippets and agent configs in one place',
                      'Creators who work with AI image generation and need to save reference prompts',
                      'Anyone who is tired of losing good prompts in chat history',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </GuideCard>
              </>
            )}

            {section === 'assets' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">What you can store</h2>
                <p className="text-xs text-text-dim mb-4">PromptVault supports 11 asset types.</p>

                <div className="bg-surface border border-border rounded-xl p-4 mb-4">
                  <div className="space-y-0.5">
                    <AssetTypeRow icon={Bot}      label="Agents"      desc="full agent instructions with system prompt, variables, tools, and example output" />
                    <AssetTypeRow icon={Sparkles}  label="Prompts"     desc="single prompts by category (image, text, code, video, music, general)" />
                    <AssetTypeRow icon={Image}     label="Images"      desc="image generation references — prompts, style notes, negative prompts" />
                    <AssetTypeRow icon={FileText}  label="Markdown"    desc="notes, documentation, and structured text" />
                    <AssetTypeRow icon={Code2}     label="Code"        desc="code snippets with language tag" />
                    <AssetTypeRow icon={GitBranch} label="Workflows"   desc="multi-step AI workflows stored as JSON" />
                    <AssetTypeRow icon={Layout}    label="Templates"   desc="reusable structured templates for common tasks" />
                    <AssetTypeRow icon={FileText}  label="Notes"       desc="quick unstructured notes" />
                    <AssetTypeRow icon={Code2}     label="JSON"        desc="raw JSON configs and data files" />
                  </div>
                </div>

                <GuideCard icon={Sparkles} title="Tags, tools, and metadata">
                  <p>Every asset can have tags, associated AI tools, a visibility setting (private / team / public), a version number, and a description. You can filter and sort by all of these in the main library view.</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title="Variables in agents">
                  <p>Agents support named variables — placeholders you fill in when running the agent. For example, you can define a <code className="bg-surface-soft px-1 rounded text-text-main">{"{{topic}}"}</code> variable and fill it with a specific topic each time you run the agent without editing the template.</p>
                </GuideCard>
              </>
            )}

            {section === 'demo' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Demo assets</h2>
                <p className="text-xs text-text-dim mb-4">The assets on your first launch are examples — not your real data.</p>

                <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-2.5">
                    <Sparkles size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-300/90 leading-relaxed">
                      <strong className="text-amber-300">The assets you see on first launch are demo assets.</strong> They exist only to show what PromptVault can do. You can safely delete them and replace them with your own prompts, agents, notes, workflows, and templates.
                    </div>
                  </div>
                </div>

                <GuideCard icon={FileText} title="Why are demo assets included?">
                  <p>An empty app is hard to understand. Demo assets show you the different asset types, what the detail inspector looks like, and how tags and tools work — so you can start using PromptVault immediately instead of starting from scratch in an empty interface.</p>
                </GuideCard>

                <GuideCard icon={Trash2} title="How to delete demo assets">
                  <p>You can delete demo assets individually: select an asset and click the trash icon in the detail panel. To delete all at once, go to <strong className="text-text-main">Settings → Danger Zone → Clear All Assets</strong>. After clearing, you can start fresh with only your own assets.</p>
                  <p className="text-text-dim">Note: demo assets exist only in your browser localStorage and in this app — they are not committed to GitHub or stored anywhere else.</p>
                </GuideCard>
              </>
            )}

            {section === 'vault' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Local Vault Storage</h2>
                <p className="text-xs text-text-dim mb-4">Save every asset as a real file on your disk.</p>

                <GuideCard icon={HardDrive} title="What the Vault is">
                  <p>By default, PromptVault stores assets in your browser's localStorage — which means they only exist in your browser and can be lost if you clear browser data. The Vault feature saves every asset as a real file in a <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> folder inside the project directory on your computer.</p>
                  <p>Once enabled, every asset you create, update, trash, restore, or delete is automatically mirrored to disk — no manual action required.</p>
                </GuideCard>

                <GuideCard icon={FileText} title="File format">
                  <p>Agents, prompts, notes, and templates are saved as <code className="bg-surface-soft px-1 rounded text-text-main">.md</code> files with YAML frontmatter. Workflows and JSON assets are saved as <code className="bg-surface-soft px-1 rounded text-text-main">.json</code> files. Each file is human-readable — you can open and edit them in any text editor.</p>
                </GuideCard>

                <GuideCard icon={HardDrive} title="How to set up the Vault">
                  <p>Go to <strong className="text-text-main">Settings → Vault Storage</strong> and:</p>
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>Click <strong className="text-text-main">Initialize Vault</strong> to create the folder structure.</li>
                    <li>Enable the Vault toggle.</li>
                    <li>Click <strong className="text-text-main">Sync to Vault</strong> to write all your current assets to disk.</li>
                  </ol>
                  <p className="text-text-dim mt-2">From that point on, vault writes happen automatically in the background.</p>
                </GuideCard>

                <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-xl p-4 text-xs text-text-muted leading-relaxed">
                  <strong className="text-text-main">Privacy reminder:</strong> The <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> folder is listed in <code className="bg-surface-soft px-1 rounded text-text-main">.gitignore</code> by default. If you push this project to GitHub, your vault files will not be included. Keep this in mind if you choose to remove vault from .gitignore.
                </div>
              </>
            )}

            {section === 'trash' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Trash & Delete</h2>
                <p className="text-xs text-text-dim mb-4">Two levels of deletion to keep your data safe.</p>

                <GuideCard icon={Trash2} title="Move to Trash">
                  <p>When you delete an asset normally (via the trash icon), the asset is moved to the <strong className="text-text-main">Trash</strong> section in the sidebar. It is hidden from your main library but not permanently gone.</p>
                  <p>If Vault is enabled, the asset is marked as trashed in the vault index — the file itself stays in place.</p>
                </GuideCard>

                <GuideCard icon={Trash2} title="Restore from Trash">
                  <p>Open the <strong className="text-text-main">Trash</strong> section in the sidebar to see all trashed assets. You can restore any of them back to your active library. Restored assets reappear in all filters and search results.</p>
                </GuideCard>

                <GuideCard icon={Trash2} title="Permanent Delete">
                  <p>In the Trash view, you can permanently delete an asset. This removes it from the app completely. If Vault is enabled, the asset file is moved to the <code className="bg-surface-soft px-1 rounded text-text-main">vault/.deleted/</code> folder — it is never hard-deleted from disk, so you can still recover it manually if needed.</p>
                </GuideCard>
              </>
            )}

            {section === 'ollama' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Ollama / Local AI</h2>
                <p className="text-xs text-text-dim mb-4">Run AI agents locally with any Ollama model — no API key required.</p>

                <GuideCard icon={Cpu} title="What Ollama integration does">
                  <p>Ollama is a free tool that lets you run large language models (like Llama 3, Mistral, or Qwen) locally on your own computer. When you enable the Ollama integration in PromptVault, you can run your agents against any model that is available in your local Ollama instance.</p>
                  <p>No data leaves your machine. No API costs. No API key required.</p>
                </GuideCard>

                <GuideCard icon={Cpu} title="How to enable Ollama">
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>Install Ollama from <strong className="text-text-main">ollama.ai</strong></li>
                    <li>Pull a model: <code className="bg-surface-soft px-1 rounded text-text-main">ollama pull llama3</code></li>
                    <li>Go to <strong className="text-text-main">Settings → Local AI</strong></li>
                    <li>Enable Ollama and click <strong className="text-text-main">Test Connection</strong></li>
                    <li>Run an agent using the Run button in the Agent detail panel</li>
                  </ol>
                </GuideCard>

                <GuideCard icon={Cpu} title="Ollama is optional">
                  <p>PromptVault works perfectly without Ollama. The Ollama integration is only needed if you want to actually run/generate text from your agents locally. Everything else — storing, organizing, copying, and managing assets — works without it.</p>
                </GuideCard>
              </>
            )}

            {section === 'privacy' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Privacy & Local-First</h2>
                <p className="text-xs text-text-dim mb-4">Your data never leaves your machine unless you choose to share it.</p>

                <GuideCard icon={Shield} title="No cloud, no tracking">
                  <p>PromptVault does not use any cloud service, database, or third-party API by default. Your profile, assets, settings, and vault files are stored only on your computer — in browser localStorage and in the local vault folder.</p>
                  <p>There is no telemetry, no analytics, and no data collection.</p>
                </GuideCard>

                <GuideCard icon={Shield} title="What is stored where">
                  <p><strong className="text-text-main">Browser localStorage:</strong> your profile name/email, app settings (accent color, sort order, etc.), asset library, and notification history. Cleared if you clear your browser data.</p>
                  <p><strong className="text-text-main">Vault folder (optional):</strong> assets saved as real files in <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> inside the project. Persists regardless of browser state.</p>
                </GuideCard>

                <GuideCard icon={Shield} title="Git and GitHub">
                  <p>The <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> folder is listed in <code className="bg-surface-soft px-1 rounded text-text-main">.gitignore</code>. If you clone this project and push it to GitHub, your vault files are not included. The app code is committed; your personal data is not.</p>
                </GuideCard>
              </>
            )}

            {section === 'workflow' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Recommended Workflow</h2>
                <p className="text-xs text-text-dim mb-4">How to get the most out of PromptVault.</p>

                <div className="bg-surface border border-border rounded-xl p-4 mb-4">
                  <WorkflowStep n={1} text="Delete the demo assets (Settings → Danger Zone → Clear All Assets) or keep them as reference." />
                  <WorkflowStep n={2} text="Create your first real asset — an agent you use often, or a prompt you keep retyping." />
                  <WorkflowStep n={3} text="Add tags and tools to your assets so you can filter them quickly later." />
                  <WorkflowStep n={4} text="Enable Vault Storage (Settings → Vault Storage → Initialize → Sync) to save your assets as real files on disk." />
                  <WorkflowStep n={5} text="Use the copy button on any asset to instantly copy it to your clipboard for use in ChatGPT, Claude, Midjourney, or any other tool." />
                  <WorkflowStep n={6} text="If you have Ollama installed, enable it in Settings → Local AI to run agents locally." />
                  <WorkflowStep n={7} text="Back up your vault/ folder periodically to a private Git repo or cloud drive." />
                </div>

                <GuideCard icon={Lightbulb} title="Future possibilities">
                  <p>PromptVault is designed to grow. Future ideas include: Supabase backend for cross-device sync, team sharing, Markdown editor with live preview, version history for assets, command palette, and image upload support.</p>
                  <p className="text-text-dim">For now, it is intentionally local-first and simple — a solid foundation to build on.</p>
                </GuideCard>
              </>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border flex-shrink-0">
          <span className="text-[10px] text-text-dim">PromptVault — Local-first AI Workspace</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-soft border border-border text-xs text-text-muted hover:text-text-main hover:border-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
