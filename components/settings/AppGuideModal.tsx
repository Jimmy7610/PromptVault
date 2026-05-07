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
  User,
  Library,
  Download,
  Upload,
  RefreshCw,
  Activity,
  Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/useI18n'

interface Props {
  open: boolean
  onClose: () => void
}

type GuideSection =
  | 'what'
  | 'login'
  | 'assets'
  | 'agents'
  | 'vault'
  | 'backup'
  | 'trash'
  | 'updates'
  | 'privacy'
  | 'workflow'
  | 'promptBuilder'

const SECTION_DEFS: { id: GuideSection; key: string; icon: React.ElementType }[] = [
  { id: 'what',          key: 'guide.sections.what',          icon: Lightbulb },
  { id: 'login',         key: 'guide.sections.login',         icon: User },
  { id: 'assets',        key: 'guide.sections.assets',        icon: Library },
  { id: 'agents',        key: 'guide.sections.agents',        icon: Bot },
  { id: 'vault',         key: 'guide.sections.vault',         icon: HardDrive },
  { id: 'backup',        key: 'guide.sections.backup',        icon: Download },
  { id: 'trash',         key: 'guide.sections.trash',         icon: Trash2 },
  { id: 'updates',       key: 'guide.sections.updates',       icon: RefreshCw },
  { id: 'privacy',       key: 'guide.sections.privacy',       icon: Shield },
  { id: 'workflow',      key: 'guide.sections.workflow',      icon: GitBranch },
  { id: 'promptBuilder', key: 'guide.sections.promptBuilder', icon: Wand2 },
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
  const { t } = useI18n()

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
              <h2 className="text-sm font-semibold text-text-main">{t('guide.title')}</h2>
              <p className="text-[10px] text-text-dim">{t('guide.subtitle')}</p>
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
              {SECTION_DEFS.map((s) => {
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
                    {t(s.key)}
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

            {section === 'login' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Login & Profile</h2>
                <p className="text-xs text-text-dim mb-4">A local identity — no account, no server, no password.</p>

                <GuideCard icon={User} title="What the login screen is">
                  <p>When you first open PromptVault, you see a login screen that asks for a name and email. This is <strong className="text-text-main">not</strong> creating an account on any server. Your name and email are stored only in your own browser's localStorage — they are used to personalize the interface and identify you locally.</p>
                  <p>There is no password, no server-side account, no email verification, and no data sent anywhere. You can enter any name and email you like.</p>
                </GuideCard>

                <GuideCard icon={User} title="Returning users">
                  <p>If you have used PromptVault before and your browser still has the localStorage data, the app will recognize your previous session and log you in automatically. If localStorage was cleared (e.g. you cleared browser data), you will see the login screen again — just enter the same name and email and your assets will be waiting in the vault if you have Vault Storage enabled.</p>
                </GuideCard>

                <GuideCard icon={User} title="Editing your profile">
                  <p>Go to <strong className="text-text-main">Settings → Profile</strong> to update your display name, email, and optional workspace name. These changes are saved locally only.</p>
                </GuideCard>

                <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-xl p-4 text-xs text-text-muted leading-relaxed">
                  <strong className="text-text-main">Privacy:</strong> Your profile data never leaves your browser. PromptVault has no user accounts, no authentication server, and no backend that stores your identity.
                </div>
              </>
            )}

            {section === 'assets' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Asset Library</h2>
                <p className="text-xs text-text-dim mb-4">11 asset types, instant search, advanced filters, and one-click copy.</p>

                <div className="bg-surface border border-border rounded-xl p-4 mb-4">
                  <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-3">Asset Types</div>
                  <div className="space-y-0.5">
                    <AssetTypeRow icon={Bot}       label="Agents"      desc="full agent instructions with system prompt, variables, tools, and example output" />
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

                <GuideCard icon={Sparkles} title="Search & filter">
                  <p>Use the <strong className="text-text-main">search bar</strong> to instantly search across all asset titles, content, and tags. Use the <strong className="text-text-main">sidebar</strong> to navigate by type (Agents, Prompts, Images…) or section (Recents, Favorites, Trash). Use the <strong className="text-text-main">Filters</strong> button to combine filters by tag, tool, visibility, and favorite status.</p>
                  <p>Sort by: last used, newest, recently updated, alphabetical, most used, most copied.</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title="Copy to clipboard">
                  <p>Every asset has a <strong className="text-text-main">Copy</strong> button. Clicking it copies the asset content to your clipboard in one click — ready to paste into ChatGPT, Claude, Midjourney, or any other tool. Copy count is tracked so you can see which assets you use most.</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title="Tags, tools, and metadata">
                  <p>Every asset can have tags, associated AI tools, a visibility setting (private / team / public), a version number, and a description. You can filter and sort by all of these in the main library view.</p>
                  <p>Agents also support <strong className="text-text-main">named variables</strong> — placeholders like <code className="bg-surface-soft px-1 rounded text-text-main">{"{{topic}}"}</code> that you fill in each time you run the agent.</p>
                </GuideCard>

                <GuideCard icon={Image} title="Image attachments">
                  <p>Image assets can store both a generation prompt and a real attached image file. Click <strong className="text-text-main">Add Image</strong> in the Image detail panel to attach a PNG, JPG, or WebP file (max 20 MB).</p>
                  <p>Attached images are saved to <code className="bg-surface-soft px-1 rounded text-text-main">vault/images/[assetId]/</code> and are included automatically in Vault Backup exports. Nothing is uploaded — files stay entirely local. Vault Storage must be enabled first.</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title="Dashboard stats">
                  <p>The stat cards on the dashboard (Total Assets, Agents, Prompts, Files, Templates, Copied Today) are calculated live from your actual library — not demo placeholders. They update instantly when you create, trash, restore, or copy assets.</p>
                  <p><strong className="text-text-main">Copied Today</strong> is tracked locally as metadata only — the copy event log stores asset ID, label, and timestamp. It does not save the copied prompt content.</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title="Editing assets">
                  <p>Click the <strong className="text-text-main">pencil (✏)</strong> icon in the top-right corner of the detail panel (next to the × close button) to open the <strong className="text-text-main">Edit Asset</strong> modal.</p>
                  <p>You can edit: title, description, tools, tags, notes, version, all type-specific content fields (system prompt, instructions, generation prompt, code, negative prompt, etc.), and variables. Asset type is locked after creation for safety — to change type, create a new asset.</p>
                  <p>The footer shows <strong className="text-amber-400">Unsaved changes</strong> when the form is dirty. Closing with unsaved changes prompts you to confirm before discarding. Saving also syncs to your vault on disk if Vault Storage is enabled.</p>
                </GuideCard>

                <GuideCard icon={Activity} title="Asset status indicators">
                  <p>Every asset card and detail panel shows a compact status row beneath the description:</p>
                  <ul className="space-y-1 mt-1 ml-2">
                    <li className="flex items-start gap-1.5"><ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" /><span><strong className="text-text-main">Last edited</strong> — "Edited today / yesterday / 3 days ago" or a full date for older assets.</span></li>
                    <li className="flex items-start gap-1.5"><ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" /><span><strong className="text-text-main">Version count</strong> — shows how many saved versions exist in history (e.g. "3 versions").</span></li>
                    <li className="flex items-start gap-1.5"><ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" /><span><strong className="text-text-main">Vault status</strong> — <span className="text-green-400">Saved to Vault</span> if the asset is on disk, or <span className="text-text-dim">Local only</span> if Vault is not enabled.</span></li>
                  </ul>
                </GuideCard>

                <GuideCard icon={GitBranch} title="Version history">
                  <p>Every time you save an edit to an asset, a new version is created automatically and stored in the version history. Up to 25 versions are kept per asset.</p>
                  <p>Click the <strong className="text-text-main">history icon (⟳)</strong> next to the edit button in the detail panel header to open Version History. From there you can view, copy, or restore any previous version. Restoring saves the current state to history first, so you never lose work.</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title="Demo assets">
                  <p>The assets on first launch are demo assets — examples only. Delete them individually (trash icon in detail panel) or all at once via <strong className="text-text-main">Settings → Danger Zone → Clear All Assets</strong>.</p>
                </GuideCard>
              </>
            )}

            {section === 'agents' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Agents & Local AI</h2>
                <p className="text-xs text-text-dim mb-4">Run agents locally with Ollama — or preview them without AI.</p>

                <GuideCard icon={Bot} title="What an Agent is">
                  <p>An Agent asset contains everything you need to define an AI assistant: a <strong className="text-text-main">system prompt</strong>, an optional <strong className="text-text-main">instruction block</strong>, named <strong className="text-text-main">variables</strong>, a list of <strong className="text-text-main">tools</strong>, and an <strong className="text-text-main">example output</strong>. Think of it as a saved AI persona or task configuration.</p>
                </GuideCard>

                <GuideCard icon={Bot} title="Run Agent (with Ollama)">
                  <p>Click <strong className="text-text-main">Run</strong> in the Agent detail panel. If Ollama is connected, the agent system prompt and instructions are sent to your local model. You fill in any variable values before running. The response is streamed back in the panel.</p>
                  <p>No data leaves your machine. No API cost. The model runs 100% locally.</p>
                </GuideCard>

                <GuideCard icon={Bot} title="Mock preview (no Ollama)">
                  <p>If Ollama is not enabled, clicking <strong className="text-text-main">Run</strong> opens a mock preview that shows exactly what would be sent to the model — the full constructed prompt with your variables filled in. This is useful for reviewing and refining your agent config before running it.</p>
                </GuideCard>

                <GuideCard icon={Bot} title="Test Agent">
                  <p>The <strong className="text-text-main">Test</strong> button validates your agent configuration: it checks that required fields are present and optionally runs a quick test prompt against Ollama with response time and model info shown.</p>
                </GuideCard>

                <GuideCard icon={Cpu} title="Setting up Ollama">
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>Install Ollama from <strong className="text-text-main">ollama.ai</strong></li>
                    <li>Pull a model: <code className="bg-surface-soft px-1 rounded text-text-main">ollama pull llama3</code></li>
                    <li>Go to <strong className="text-text-main">Settings → Local AI</strong></li>
                    <li>Enable Ollama and click <strong className="text-text-main">Test Connection</strong></li>
                  </ol>
                  <p className="text-text-dim mt-2">Ollama is entirely optional — everything except live agent execution works without it.</p>
                </GuideCard>
              </>
            )}

            {section === 'vault' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Vault Storage</h2>
                <p className="text-xs text-text-dim mb-4">Save every asset as a real file on your disk.</p>

                <GuideCard icon={HardDrive} title="What the Vault is">
                  <p>By default, PromptVault stores assets in your browser's localStorage — which can be lost if you clear browser data. Vault Storage saves every asset as a real file in a <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> folder inside the project directory on your computer.</p>
                  <p>Agents, prompts, notes, and templates are saved as <code className="bg-surface-soft px-1 rounded text-text-main">.md</code> files with YAML frontmatter. Workflows and JSON assets are saved as <code className="bg-surface-soft px-1 rounded text-text-main">.json</code> files. Each file is human-readable.</p>
                </GuideCard>

                <GuideCard icon={HardDrive} title="How to set up Vault Storage">
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>Go to <strong className="text-text-main">Settings → Vault Storage</strong></li>
                    <li>Click <strong className="text-text-main">Initialize Vault</strong> — creates the folder structure and index.json</li>
                    <li>Enable the Vault toggle</li>
                    <li>Click <strong className="text-text-main">Sync Current Assets to Vault</strong> to write all your assets to disk</li>
                  </ol>
                  <p className="text-text-dim mt-2">After syncing, every create/update/trash/restore/delete is automatically mirrored to disk.</p>
                </GuideCard>

                <GuideCard icon={HardDrive} title="Vault tools">
                  <p><strong className="text-text-main">Load Assets from Vault</strong> — reads vault files and merges them into your library. Useful when moving the app to a new browser or after a clean reinstall.</p>
                  <p><strong className="text-text-main">Rebuild Vault Index</strong> — scans all vault folders and regenerates index.json. Use this after manually editing vault files outside the app.</p>
                </GuideCard>

                <GuideCard icon={Activity} title="Vault Health Check">
                  <p>Click <strong className="text-text-main">Run Vault Health Check</strong> to verify your vault is intact. It checks: vault folder exists, index.json exists and is valid, all required folders are present, all file references are on disk, and no duplicate asset IDs. Results are shown immediately in the panel — green for healthy, amber for warnings, red for errors.</p>
                  <p className="text-text-dim">Health Check never reads your prompt or agent content — it only inspects folder structure and index metadata.</p>
                </GuideCard>

                <GuideCard icon={Image} title="Image file attachments">
                  <p>Image assets can have a real image file attached (PNG, JPG, WebP). The file is stored in <code className="bg-surface-soft px-1 rounded text-text-main">vault/images/[assetId]/original.[ext]</code> alongside a small <code className="bg-surface-soft px-1 rounded text-text-main">metadata.json</code>.</p>
                  <p>Attached images are automatically included in Vault Backup exports and excluded from Git via <code className="bg-surface-soft px-1 rounded text-text-main">.gitignore</code>.</p>
                </GuideCard>

                <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-xl p-4 text-xs text-text-muted leading-relaxed">
                  <strong className="text-text-main">Privacy reminder:</strong> The <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> folder is listed in <code className="bg-surface-soft px-1 rounded text-text-main">.gitignore</code>. If you push this project to GitHub, your vault files are not included.
                </div>
              </>
            )}

            {section === 'backup' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Vault Backup & Transfer</h2>
                <p className="text-xs text-text-dim mb-4">Move your vault between computers with a .zip backup.</p>

                <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-2.5">
                    <Sparkles size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-300/90 leading-relaxed">
                      <strong className="text-amber-300">Nothing is uploaded by PromptVault.</strong> Export and import work entirely locally — the zip file never leaves your machine unless you choose to move it yourself.
                    </div>
                  </div>
                </div>

                <GuideCard icon={Download} title="Export Vault Backup">
                  <p>Go to <strong className="text-text-main">Settings → Vault Storage → Export Vault Backup</strong>. A <code className="bg-surface-soft px-1 rounded text-text-main">.zip</code> file downloads to your computer containing the entire contents of your vault folder.</p>
                  <p>Use this to: back up your vault before a reinstall, transfer to another computer, or archive a specific state of your library.</p>
                </GuideCard>

                <GuideCard icon={Upload} title="Import Vault Backup">
                  <p>On the target computer, go to <strong className="text-text-main">Settings → Vault Storage → Import Vault Backup</strong>. Select the zip file and type <code className="bg-surface-soft px-1 rounded text-text-main">IMPORT</code> to confirm. The import process:</p>
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>Validates the zip contains a valid vault structure</li>
                    <li>Backs up your current vault to <code className="bg-surface-soft px-1 rounded text-text-main">vault-import-backups/</code></li>
                    <li>Replaces the vault with the imported one</li>
                    <li>Runs a Health Check automatically</li>
                  </ol>
                  <p className="text-text-dim mt-2">After import, click <strong className="text-text-main">Load Assets from Vault</strong> to bring the imported assets into the app library.</p>
                </GuideCard>

                <GuideCard icon={HardDrive} title="Backup reminder">
                  <p>The <strong className="text-text-main">Vault Backup</strong> card in Settings → Vault Storage shows when you last exported a backup. The status is <strong className="text-text-main text-green-400">Backup current</strong> if the last backup was within 7 days, or <strong className="text-amber-400">Backup recommended</strong> if it has been longer or you have never backed up.</p>
                </GuideCard>
              </>
            )}

            {section === 'trash' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Trash & Delete</h2>
                <p className="text-xs text-text-dim mb-4">Two levels of deletion to keep your data safe.</p>

                <GuideCard icon={Trash2} title="Move to Trash">
                  <p>When you delete an asset normally (via the trash icon in the detail panel), the asset is moved to the <strong className="text-text-main">Trash</strong> section in the sidebar. It is hidden from your main library but not permanently gone.</p>
                  <p>If Vault is enabled, the asset is marked as trashed in the vault index — the file itself stays in place.</p>
                </GuideCard>

                <GuideCard icon={Trash2} title="Restore from Trash">
                  <p>Open the <strong className="text-text-main">Trash</strong> section in the sidebar to see all trashed assets. You can restore any of them back to your active library. Restored assets reappear in all filters and search results.</p>
                </GuideCard>

                <GuideCard icon={Trash2} title="Permanent Delete">
                  <p>In the Trash view, you can permanently delete an asset. This removes it from the app completely. If Vault is enabled, the asset file is moved to the <code className="bg-surface-soft px-1 rounded text-text-main">vault/.deleted/</code> folder — it is never hard-deleted from disk, so you can still recover it manually if needed.</p>
                </GuideCard>

                <GuideCard icon={Trash2} title="Empty Trash">
                  <p>Go to <strong className="text-text-main">Settings → Danger Zone → Empty Trash</strong> to permanently delete all trashed assets at once. This requires typing <code className="bg-surface-soft px-1 rounded text-text-main">DELETE</code> to confirm.</p>
                </GuideCard>
              </>
            )}

            {section === 'updates' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">App Updates</h2>
                <p className="text-xs text-text-dim mb-4">Pull the latest version from GitHub without touching your vault.</p>

                <GuideCard icon={RefreshCw} title="How to update">
                  <p>Go to <strong className="text-text-main">Settings → App Updates</strong> and click <strong className="text-text-main">Check for Updates</strong>. The updater fetches the latest commit from the GitHub main branch and shows you the current vs. latest commit.</p>
                  <p>If an update is available and all safety checks pass, click <strong className="text-text-main">Install Update</strong>. After it finishes, restart the dev server manually.</p>
                </GuideCard>

                <GuideCard icon={RefreshCw} title="Three-phase install">
                  <p>The updater runs three phases in order:</p>
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li><strong className="text-text-main">Phase 1 — Download:</strong> <code className="bg-surface-soft px-1 rounded text-text-main">git pull --ff-only origin main</code></li>
                    <li><strong className="text-text-main">Phase 2 — Dependencies:</strong> <code className="bg-surface-soft px-1 rounded text-text-main">npm install</code></li>
                    <li><strong className="text-text-main">Phase 3 — Verify:</strong> <code className="bg-surface-soft px-1 rounded text-text-main">npm run build</code></li>
                  </ol>
                  <p className="text-text-dim mt-2">After build completes, restart the dev server manually. The updater never kills the running process.</p>
                </GuideCard>

                <GuideCard icon={RefreshCw} title="Partial update (amber warning)">
                  <p>If Phase 1 (git pull) succeeds but npm install or npm run build fails, the updater shows an <strong className="text-amber-400">amber warning</strong> instead of a red failure. The app code is already updated on disk.</p>
                  <p>In that case, run the fix commands manually in a terminal:</p>
                  <div className="bg-surface-soft rounded-lg px-3 py-2 mt-2 font-mono text-[10px] text-text-dim leading-relaxed">
                    npm install<br />
                    npm run build<br />
                    npm run dev
                  </div>
                </GuideCard>

                <GuideCard icon={RefreshCw} title="Safety guarantees">
                  <p>The updater refuses to install if your working tree has uncommitted code changes, and refuses if <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> is not git-ignored. Your vault data, localStorage, and personal assets are never touched by the update process.</p>
                </GuideCard>
              </>
            )}

            {section === 'privacy' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Privacy & Local-First</h2>
                <p className="text-xs text-text-dim mb-4">Your data never leaves your machine unless you choose to share it.</p>

                <GuideCard icon={Shield} title="No cloud, no tracking">
                  <p>PromptVault does not use any cloud service, database, or third-party API by default. Your profile, assets, settings, and vault files are stored only on your computer — in browser localStorage and in the local vault folder.</p>
                  <p>There is no telemetry, no analytics, and no data collection of any kind.</p>
                </GuideCard>

                <GuideCard icon={Shield} title="What is stored where">
                  <p><strong className="text-text-main">Browser localStorage:</strong> your profile name/email, app settings (accent color, sort order, etc.), asset library, and notification history. Cleared if you clear your browser data.</p>
                  <p><strong className="text-text-main">Vault folder (optional):</strong> assets saved as real files in <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> inside the project. Persists regardless of browser state.</p>
                </GuideCard>

                <GuideCard icon={Shield} title="Git and GitHub">
                  <p>The <code className="bg-surface-soft px-1 rounded text-text-main">vault/</code> folder is listed in <code className="bg-surface-soft px-1 rounded text-text-main">.gitignore</code>. If you clone this project and push it to GitHub, your vault files are not included. The app code is committed; your personal data is not.</p>
                </GuideCard>

                <GuideCard icon={Shield} title="Ollama privacy">
                  <p>When you run agents using the Ollama integration, prompts are sent only to your local Ollama instance — not to any external server. No data leaves your machine.</p>
                </GuideCard>
              </>
            )}

            {section === 'workflow' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Recommended Workflow</h2>
                <p className="text-xs text-text-dim mb-4">How to get the most out of PromptVault.</p>

                <div className="bg-surface border border-border rounded-xl p-4 mb-4">
                  <WorkflowStep n={1} text="Delete the demo assets (Settings → Danger Zone → Clear All Assets) or keep them as reference." />
                  <WorkflowStep n={2} text="Create your first real asset — an agent you use often, or a prompt you keep retyping. Press N anywhere in the app to open the new asset modal." />
                  <WorkflowStep n={3} text="Add tags and tools to your assets so you can filter them quickly later." />
                  <WorkflowStep n={4} text="Enable Vault Storage (Settings → Vault Storage → Initialize → Sync) to save your assets as real files on disk." />
                  <WorkflowStep n={5} text="Use the Copy button on any asset to instantly copy it to your clipboard for use in ChatGPT, Claude, Midjourney, or any other tool." />
                  <WorkflowStep n={6} text="If you have Ollama installed, enable it in Settings → Local AI to run agents locally with no API cost." />
                  <WorkflowStep n={7} text="Export a vault backup regularly (Settings → Vault Storage → Export Vault Backup). Keep it on an external disk or a private cloud folder." />
                  <WorkflowStep n={8} text="Check for app updates in Settings → App Updates to get the latest features." />
                </div>

                <GuideCard icon={Lightbulb} title="Interface language">
                  <p>Go to <strong className="text-text-main">Settings → Appearance → Language</strong> to switch the interface between <strong className="text-text-main">English</strong> and <strong className="text-text-main">Swedish</strong>. The language setting affects all UI labels, buttons, section headings, and status messages.</p>
                  <p className="text-text-dim">Your asset content — titles, descriptions, prompts, instructions — is never translated. Only the interface labels change.</p>
                </GuideCard>

                <GuideCard icon={Lightbulb} title="Future possibilities">
                  <p>PromptVault is designed to grow. Future ideas include: Supabase backend for cross-device sync, team sharing, Markdown editor with live preview, command palette, and expanded AI tool integrations.</p>
                  <p className="text-text-dim">It is intentionally local-first — a solid foundation to build on.</p>
                </GuideCard>
              </>
            )}

            {section === 'promptBuilder' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">Prompt Builder / Variables</h2>
                <p className="text-xs text-text-dim mb-4">Fill in variables to generate a finished prompt — without changing the original.</p>

                <GuideCard icon={Wand2} title="What are prompt variables?">
                  <p>You can write prompts and agent instructions that contain named placeholders wrapped in curly braces, like <code className="bg-surface-soft px-1 rounded text-text-main">{"{"}</code><code className="bg-surface-soft px-1 rounded text-text-main">{"subject}"}</code> or <code className="bg-surface-soft px-1 rounded text-text-main">{"{lighting}"}</code>. PromptVault automatically detects any <code className="bg-surface-soft px-1 rounded text-text-main">{"{variablename}"}</code> patterns in your prompt or generation prompt.</p>
                  <p>Example prompt with variables:</p>
                  <div className="bg-background rounded-lg px-3 py-2 mt-1 font-mono text-[11px] text-text-muted leading-relaxed">
                    A cinematic portrait of <span className="text-accent-blue">{'{subject}'}</span> in <span className="text-accent-blue">{'{location}'}</span>, wearing <span className="text-accent-blue">{'{outfit}'}</span>, with <span className="text-accent-blue">{'{lighting}'}</span>, hyperrealistic, cinematic
                  </div>
                </GuideCard>

                <GuideCard icon={Wand2} title="How to use Build Prompt">
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>Open a Prompt or Image asset that contains <code className="bg-surface-soft px-1 rounded text-text-main">{'{variable}'}</code> placeholders.</li>
                    <li>Click <strong className="text-text-main">Build Prompt</strong> in the Quick Actions footer.</li>
                    <li>A modal opens showing all detected variables as input fields.</li>
                    <li>Type values into each field — the Generated Prompt updates live.</li>
                    <li>Click <strong className="text-text-main">Copy Generated Prompt</strong> to copy the finished result.</li>
                    <li>Or click <strong className="text-text-main">Save as New Asset</strong> to save the result as a new prompt asset in your library.</li>
                  </ol>
                  <p className="text-text-dim mt-2">The Build Prompt button also appears in Agent details when the system prompt or instructions contain variables.</p>
                </GuideCard>

                <GuideCard icon={Wand2} title="Original asset is never changed">
                  <p>Filling values in the Prompt Builder does <strong className="text-text-main">not</strong> modify your original prompt. The builder is a temporary workspace — your original template stays intact for reuse.</p>
                  <p>Any generated prompt you save becomes a new independent asset. Editing it later uses normal version history — the original is not affected.</p>
                </GuideCard>

                <GuideCard icon={Wand2} title="Variable rules">
                  <ul className="space-y-1 mt-1 ml-2">
                    <li className="flex items-start gap-1.5"><ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" /><span>Variable names must start with a letter and may contain letters, numbers, underscores, and dashes.</span></li>
                    <li className="flex items-start gap-1.5"><ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" /><span>Variables are detected in order of first appearance and deduplicated.</span></li>
                    <li className="flex items-start gap-1.5"><ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" /><span>Unfilled variables remain as <code className="bg-surface-soft px-1 rounded text-text-main">{'{variablename}'}</code> in the output — they are highlighted amber so you can spot them.</span></li>
                    <li className="flex items-start gap-1.5"><ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" /><span>Variables are only detected in prompt and image assets, and in agent system prompts and instructions. Code and JSON assets do not trigger the builder automatically.</span></li>
                  </ul>
                </GuideCard>
              </>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border flex-shrink-0">
          <span className="text-[10px] text-text-dim">PromptVault — Created by Jimmy Eliasson · Copyright © Jimmy Eliasson</span>
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
