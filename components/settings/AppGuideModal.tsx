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

const CODE = 'bg-surface-soft px-1 rounded text-text-main'

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

            {/* ── What is PromptVault? ── */}
            {section === 'what' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.what')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.what')}</p>

                <GuideCard icon={Sparkles} title={t('guide.cards.what.workspace.title')}>
                  <p>{t('guide.cards.what.workspace.body1')}</p>
                  <p>{t('guide.cards.what.workspace.body2')}</p>
                </GuideCard>

                <GuideCard icon={HardDrive} title={t('guide.cards.what.localFirst.title')}>
                  <p>{t('guide.cards.what.localFirst.body1')}</p>
                  <p>
                    {t('guide.cards.what.localFirst.body2a')}
                    <code className={CODE}>vault/</code>
                    {t('guide.cards.what.localFirst.body2b')}
                  </p>
                </GuideCard>

                <GuideCard icon={Lightbulb} title={t('guide.cards.what.whoFor.title')}>
                  <p>{t('guide.cards.what.whoFor.intro')}</p>
                  <ul className="space-y-1 mt-1 ml-2">
                    {(['item1','item2','item3','item4','item5'] as const).map((k) => (
                      <li key={k} className="flex items-start gap-1.5">
                        <ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" />
                        <span>{t(`guide.cards.what.whoFor.${k}`)}</span>
                      </li>
                    ))}
                  </ul>
                </GuideCard>
              </>
            )}

            {/* ── Login & Profile ── */}
            {section === 'login' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.login')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.login')}</p>

                <GuideCard icon={User} title={t('guide.cards.login.whatLogin.title')}>
                  <p>{t('guide.cards.login.whatLogin.body1')}</p>
                  <p>{t('guide.cards.login.whatLogin.body2')}</p>
                </GuideCard>

                <GuideCard icon={User} title={t('guide.cards.login.returning.title')}>
                  <p>{t('guide.cards.login.returning.body')}</p>
                </GuideCard>

                <GuideCard icon={User} title={t('guide.cards.login.editProfile.title')}>
                  <p>{t('guide.cards.login.editProfile.body')}</p>
                </GuideCard>

                <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-xl p-4 text-xs text-text-muted leading-relaxed">
                  <strong className="text-text-main">{t('guide.cards.login.privacyNote.label')}</strong>{' '}
                  {t('guide.cards.login.privacyNote.body')}
                </div>
              </>
            )}

            {/* ── Asset Library ── */}
            {section === 'assets' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.assets')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.assets')}</p>

                <div className="bg-surface border border-border rounded-xl p-4 mb-4">
                  <div className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-3">{t('guide.assetTypesHeading')}</div>
                  <div className="space-y-0.5">
                    <AssetTypeRow icon={Bot}       label="Agents"    desc={t('guide.cards.assets.typeDescs.agents')} />
                    <AssetTypeRow icon={Sparkles}  label="Prompts"   desc={t('guide.cards.assets.typeDescs.prompts')} />
                    <AssetTypeRow icon={Image}     label="Images"    desc={t('guide.cards.assets.typeDescs.images')} />
                    <AssetTypeRow icon={FileText}  label="Markdown"  desc={t('guide.cards.assets.typeDescs.markdown')} />
                    <AssetTypeRow icon={Code2}     label="Code"      desc={t('guide.cards.assets.typeDescs.code')} />
                    <AssetTypeRow icon={GitBranch} label="Workflows" desc={t('guide.cards.assets.typeDescs.workflows')} />
                    <AssetTypeRow icon={Layout}    label="Templates" desc={t('guide.cards.assets.typeDescs.templates')} />
                    <AssetTypeRow icon={FileText}  label="Notes"     desc={t('guide.cards.assets.typeDescs.notes')} />
                    <AssetTypeRow icon={Code2}     label="JSON"      desc={t('guide.cards.assets.typeDescs.json')} />
                  </div>
                </div>

                <GuideCard icon={Sparkles} title={t('guide.cards.assets.searchFilter.title')}>
                  <p>{t('guide.cards.assets.searchFilter.body1')}</p>
                  <p>{t('guide.cards.assets.searchFilter.body2')}</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title={t('guide.cards.assets.copyClip.title')}>
                  <p>{t('guide.cards.assets.copyClip.body')}</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title={t('guide.cards.assets.metadata.title')}>
                  <p>{t('guide.cards.assets.metadata.body1')}</p>
                  <p>{t('guide.cards.assets.metadata.body2')}</p>
                </GuideCard>

                <GuideCard icon={Image} title={t('guide.cards.assets.imageAttach.title')}>
                  <p>{t('guide.cards.assets.imageAttach.body1')}</p>
                  <p>
                    {t('guide.cards.assets.imageAttach.body2a')}
                    <code className={CODE}>vault/images/[assetId]/</code>
                    {t('guide.cards.assets.imageAttach.body2b')}
                  </p>
                </GuideCard>

                <GuideCard icon={Sparkles} title={t('guide.cards.assets.dashStats.title')}>
                  <p>{t('guide.cards.assets.dashStats.body1')}</p>
                  <p>{t('guide.cards.assets.dashStats.body2')}</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title={t('guide.cards.assets.editAsset.title')}>
                  <p>{t('guide.cards.assets.editAsset.body1')}</p>
                  <p>{t('guide.cards.assets.editAsset.body2')}</p>
                  <p>{t('guide.cards.assets.editAsset.body3')}</p>
                </GuideCard>

                <GuideCard icon={Activity} title={t('guide.cards.assets.statusRow.title')}>
                  <p>{t('guide.cards.assets.statusRow.intro')}</p>
                  <ul className="space-y-1 mt-1 ml-2">
                    {(['item1','item2','item3'] as const).map((k) => (
                      <li key={k} className="flex items-start gap-1.5">
                        <ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" />
                        <span>{t(`guide.cards.assets.statusRow.${k}`)}</span>
                      </li>
                    ))}
                  </ul>
                </GuideCard>

                <GuideCard icon={GitBranch} title={t('guide.cards.assets.versionHistory.title')}>
                  <p>{t('guide.cards.assets.versionHistory.body1')}</p>
                  <p>{t('guide.cards.assets.versionHistory.body2')}</p>
                </GuideCard>

                <GuideCard icon={Sparkles} title={t('guide.cards.assets.demoAssets.title')}>
                  <p>{t('guide.cards.assets.demoAssets.body')}</p>
                </GuideCard>
              </>
            )}

            {/* ── Agents & Local AI ── */}
            {section === 'agents' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.agents')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.agents')}</p>

                <GuideCard icon={Bot} title={t('guide.cards.agents.whatAgent.title')}>
                  <p>{t('guide.cards.agents.whatAgent.body')}</p>
                </GuideCard>

                <GuideCard icon={Bot} title={t('guide.cards.agents.runAgent.title')}>
                  <p>{t('guide.cards.agents.runAgent.body1')}</p>
                  <p>{t('guide.cards.agents.runAgent.body2')}</p>
                </GuideCard>

                <GuideCard icon={Bot} title={t('guide.cards.agents.mockPreview.title')}>
                  <p>{t('guide.cards.agents.mockPreview.body')}</p>
                </GuideCard>

                <GuideCard icon={Bot} title={t('guide.cards.agents.testAgent.title')}>
                  <p>{t('guide.cards.agents.testAgent.body')}</p>
                </GuideCard>

                <GuideCard icon={Cpu} title={t('guide.cards.agents.setupOllama.title')}>
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>{t('guide.cards.agents.setupOllama.item1')}</li>
                    <li>
                      {t('guide.cards.agents.setupOllama.item2a')}
                      <code className={CODE}>ollama pull llama3</code>
                    </li>
                    <li>{t('guide.cards.agents.setupOllama.item3')}</li>
                    <li>{t('guide.cards.agents.setupOllama.item4')}</li>
                  </ol>
                  <p className="text-text-dim mt-2">{t('guide.cards.agents.setupOllama.note')}</p>
                </GuideCard>
              </>
            )}

            {/* ── Vault Storage ── */}
            {section === 'vault' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.vault')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.vault')}</p>

                <GuideCard icon={HardDrive} title={t('guide.cards.vault.whatVault.title')}>
                  <p>
                    {t('guide.cards.vault.whatVault.body1a')}
                    <code className={CODE}>vault/</code>
                    {t('guide.cards.vault.whatVault.body1b')}
                  </p>
                  <p>
                    {t('guide.cards.vault.whatVault.body2a')}
                    <code className={CODE}>.md</code>
                    {t('guide.cards.vault.whatVault.body2b')}
                    <code className={CODE}>.json</code>
                    {t('guide.cards.vault.whatVault.body2c')}
                  </p>
                </GuideCard>

                <GuideCard icon={HardDrive} title={t('guide.cards.vault.setup.title')}>
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>{t('guide.cards.vault.setup.item1')}</li>
                    <li>{t('guide.cards.vault.setup.item2')}</li>
                    <li>{t('guide.cards.vault.setup.item3')}</li>
                    <li>{t('guide.cards.vault.setup.item4')}</li>
                  </ol>
                  <p className="text-text-dim mt-2">{t('guide.cards.vault.setup.note')}</p>
                </GuideCard>

                <GuideCard icon={HardDrive} title={t('guide.cards.vault.tools.title')}>
                  <p>{t('guide.cards.vault.tools.body1')}</p>
                  <p>{t('guide.cards.vault.tools.body2')}</p>
                  <p>{t('guide.cards.vault.tools.body3')}</p>
                </GuideCard>

                <GuideCard icon={Activity} title={t('guide.cards.vault.healthCheck.title')}>
                  <p>{t('guide.cards.vault.healthCheck.body')}</p>
                  <p className="text-text-dim">{t('guide.cards.vault.healthCheck.note')}</p>
                </GuideCard>

                <GuideCard icon={Image} title={t('guide.cards.vault.imageAttach.title')}>
                  <p>
                    {t('guide.cards.vault.imageAttach.body1a')}
                    <code className={CODE}>vault/images/[assetId]/original.[ext]</code>
                    {t('guide.cards.vault.imageAttach.body1b')}
                    <code className={CODE}>metadata.json</code>
                    {t('guide.cards.vault.imageAttach.body1c')}
                  </p>
                  <p>
                    {t('guide.cards.vault.imageAttach.body2a')}
                    <code className={CODE}>.gitignore</code>
                    {t('guide.cards.vault.imageAttach.body2b')}
                  </p>
                </GuideCard>

                <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-xl p-4 text-xs text-text-muted leading-relaxed">
                  <strong className="text-text-main">{t('guide.cards.vault.privacyNote.label')}</strong>{' '}
                  {t('guide.cards.vault.privacyNote.body')}
                </div>
              </>
            )}

            {/* ── Backup & Transfer ── */}
            {section === 'backup' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.backup')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.backup')}</p>

                <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-2.5">
                    <Sparkles size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-300/90 leading-relaxed">
                      <strong className="text-amber-300">{t('guide.cards.backup.warning.label')}</strong>{' '}
                      {t('guide.cards.backup.warning.body')}
                    </div>
                  </div>
                </div>

                <GuideCard icon={Download} title={t('guide.cards.backup.exportVault.title')}>
                  <p>
                    {t('guide.cards.backup.exportVault.body1a')}
                    <code className={CODE}>.zip</code>
                    {t('guide.cards.backup.exportVault.body1b')}
                  </p>
                  <p>{t('guide.cards.backup.exportVault.body2')}</p>
                </GuideCard>

                <GuideCard icon={Upload} title={t('guide.cards.backup.importVault.title')}>
                  <p>
                    {t('guide.cards.backup.importVault.body1a')}
                    <code className={CODE}>IMPORT</code>
                    {t('guide.cards.backup.importVault.body1b')}
                  </p>
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>{t('guide.cards.backup.importVault.item1')}</li>
                    <li>
                      {t('guide.cards.backup.importVault.item2a')}
                      <code className={CODE}>vault-import-backups/</code>
                    </li>
                    <li>{t('guide.cards.backup.importVault.item3')}</li>
                    <li>{t('guide.cards.backup.importVault.item4')}</li>
                  </ol>
                  <p className="text-text-dim mt-2">{t('guide.cards.backup.importVault.note')}</p>
                </GuideCard>

                <GuideCard icon={HardDrive} title={t('guide.cards.backup.backupReminder.title')}>
                  <p>{t('guide.cards.backup.backupReminder.body')}</p>
                </GuideCard>
              </>
            )}

            {/* ── Trash & Delete ── */}
            {section === 'trash' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.trash')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.trash')}</p>

                <GuideCard icon={Trash2} title={t('guide.cards.trash.moveToTrash.title')}>
                  <p>{t('guide.cards.trash.moveToTrash.body1')}</p>
                  <p>{t('guide.cards.trash.moveToTrash.body2')}</p>
                </GuideCard>

                <GuideCard icon={Trash2} title={t('guide.cards.trash.restore.title')}>
                  <p>{t('guide.cards.trash.restore.body')}</p>
                </GuideCard>

                <GuideCard icon={Trash2} title={t('guide.cards.trash.permDelete.title')}>
                  <p>
                    {t('guide.cards.trash.permDelete.body1a')}
                    <code className={CODE}>vault/.deleted/</code>
                    {t('guide.cards.trash.permDelete.body1b')}
                  </p>
                </GuideCard>

                <GuideCard icon={Trash2} title={t('guide.cards.trash.emptyTrash.title')}>
                  <p>
                    {t('guide.cards.trash.emptyTrash.body1a')}
                    <code className={CODE}>DELETE</code>
                    {t('guide.cards.trash.emptyTrash.body1b')}
                  </p>
                </GuideCard>
              </>
            )}

            {/* ── App Updates ── */}
            {section === 'updates' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.updates')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.updates')}</p>

                <GuideCard icon={RefreshCw} title={t('guide.cards.updates.howToUpdate.title')}>
                  <p>{t('guide.cards.updates.howToUpdate.body1')}</p>
                  <p>{t('guide.cards.updates.howToUpdate.body2')}</p>
                </GuideCard>

                <GuideCard icon={RefreshCw} title={t('guide.cards.updates.threePhase.title')}>
                  <p>{t('guide.cards.updates.threePhase.intro')}</p>
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    <li>
                      {t('guide.cards.updates.threePhase.item1')}
                      <code className={CODE}>git pull --ff-only origin main</code>
                    </li>
                    <li>
                      {t('guide.cards.updates.threePhase.item2')}
                      <code className={CODE}>npm install</code>
                    </li>
                    <li>
                      {t('guide.cards.updates.threePhase.item3')}
                      <code className={CODE}>npm run build</code>
                    </li>
                  </ol>
                  <p className="text-text-dim mt-2">{t('guide.cards.updates.threePhase.note')}</p>
                </GuideCard>

                <GuideCard icon={RefreshCw} title={t('guide.cards.updates.partialUpdate.title')}>
                  <p>{t('guide.cards.updates.partialUpdate.body1')}</p>
                  <p>{t('guide.cards.updates.partialUpdate.body2')}</p>
                  <div className="bg-surface-soft rounded-lg px-3 py-2 mt-2 font-mono text-[10px] text-text-dim leading-relaxed">
                    npm install<br />
                    npm run build<br />
                    npm run dev
                  </div>
                </GuideCard>

                <GuideCard icon={RefreshCw} title={t('guide.cards.updates.safety.title')}>
                  <p>{t('guide.cards.updates.safety.body')}</p>
                </GuideCard>
              </>
            )}

            {/* ── Privacy & Local-first ── */}
            {section === 'privacy' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.privacy')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.privacy')}</p>

                <GuideCard icon={Shield} title={t('guide.cards.privacy.noCloud.title')}>
                  <p>{t('guide.cards.privacy.noCloud.body1')}</p>
                  <p>{t('guide.cards.privacy.noCloud.body2')}</p>
                </GuideCard>

                <GuideCard icon={Shield} title={t('guide.cards.privacy.storedWhere.title')}>
                  <p>{t('guide.cards.privacy.storedWhere.body1')}</p>
                  <p>
                    {t('guide.cards.privacy.storedWhere.body2a')}
                    <code className={CODE}>vault/</code>
                    {t('guide.cards.privacy.storedWhere.body2b')}
                  </p>
                </GuideCard>

                <GuideCard icon={Shield} title={t('guide.cards.privacy.gitHub.title')}>
                  <p>{t('guide.cards.privacy.gitHub.body')}</p>
                </GuideCard>

                <GuideCard icon={Shield} title={t('guide.cards.privacy.ollamaPrivacy.title')}>
                  <p>{t('guide.cards.privacy.ollamaPrivacy.body')}</p>
                </GuideCard>
              </>
            )}

            {/* ── Recommended Workflow ── */}
            {section === 'workflow' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.workflow')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.workflow')}</p>

                <div className="bg-surface border border-border rounded-xl p-4 mb-4">
                  {([1,2,3,4,5,6,7,8] as const).map((n) => (
                    <WorkflowStep key={n} n={n} text={t(`guide.cards.workflow.step${n}`)} />
                  ))}
                </div>

                <GuideCard icon={Lightbulb} title={t('guide.cards.workflow.language.title')}>
                  <p>{t('guide.cards.workflow.language.body')}</p>
                  <p className="text-text-dim">{t('guide.cards.workflow.language.note')}</p>
                </GuideCard>

                <GuideCard icon={Lightbulb} title={t('guide.cards.workflow.future.title')}>
                  <p>{t('guide.cards.workflow.future.body')}</p>
                  <p className="text-text-dim">{t('guide.cards.workflow.future.note')}</p>
                </GuideCard>
              </>
            )}

            {/* ── Prompt Builder ── */}
            {section === 'promptBuilder' && (
              <>
                <h2 className="text-base font-bold text-text-main mb-1">{t('guide.sections.promptBuilder')}</h2>
                <p className="text-xs text-text-dim mb-4">{t('guide.sub.promptBuilder')}</p>

                <GuideCard icon={Wand2} title={t('guide.cards.promptBuilder.whatVars.title')}>
                  <p>{t('guide.cards.promptBuilder.whatVars.body1')}</p>
                  <p>{t('guide.cards.promptBuilder.whatVars.body2')}</p>
                  <div className="bg-background rounded-lg px-3 py-2 mt-1 font-mono text-[11px] text-text-muted leading-relaxed">
                    A cinematic portrait of <span className="text-accent-blue">{'{subject}'}</span> in <span className="text-accent-blue">{'{location}'}</span>, wearing <span className="text-accent-blue">{'{outfit}'}</span>, with <span className="text-accent-blue">{'{lighting}'}</span>, hyperrealistic, cinematic
                  </div>
                </GuideCard>

                <GuideCard icon={Wand2} title={t('guide.cards.promptBuilder.howToUse.title')}>
                  <ol className="space-y-1 mt-1 ml-2 list-decimal list-inside">
                    {(['item1','item2','item3','item4','item5','item6'] as const).map((k) => (
                      <li key={k}>{t(`guide.cards.promptBuilder.howToUse.${k}`)}</li>
                    ))}
                  </ol>
                  <p className="text-text-dim mt-2">{t('guide.cards.promptBuilder.howToUse.note')}</p>
                </GuideCard>

                <GuideCard icon={Wand2} title={t('guide.cards.promptBuilder.neverChanged.title')}>
                  <p>{t('guide.cards.promptBuilder.neverChanged.body1')}</p>
                  <p>{t('guide.cards.promptBuilder.neverChanged.body2')}</p>
                </GuideCard>

                <GuideCard icon={Wand2} title={t('guide.cards.promptBuilder.varRules.title')}>
                  <ul className="space-y-1 mt-1 ml-2">
                    {(['item1','item2','item3','item4'] as const).map((k) => (
                      <li key={k} className="flex items-start gap-1.5">
                        <ChevronRight size={10} className="text-accent-blue flex-shrink-0 mt-1" />
                        <span>{t(`guide.cards.promptBuilder.varRules.${k}`)}</span>
                      </li>
                    ))}
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
            {t('guide.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
