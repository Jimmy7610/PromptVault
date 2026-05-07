# PromptVault

**Universal AI Workspace** — Organize and manage your AI agents, prompts, images, markdown files, code snippets, workflows, and templates in one premium dark-mode workspace.

---

## What is PromptVault?

PromptVault is a personal AI command center for creators, developers, and AI power users. It gives you a structured, fast, and visually polished place to store and reuse everything you use in your AI work:

- 🤖 **AI Agents** — with system prompts, instructions, variables, and tools
- 💬 **Prompts** — text and image prompts with negative prompts and settings
- 🖼️ **Images** — visual references and moodboards
- 📄 **Markdown Files** — documents, notes, plans with preview
- 💻 **Code Snippets** — with language labels and line numbers
- 🔀 **Workflows** — multi-step automation processes
- 📋 **Templates** — reusable structures and briefs
- 🗒️ **Notes** — quick research notes and logs

---

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build for production

```bash
npm run build
npm run start
```

---

## Project Structure

```
promptvault/
├── app/
│   ├── globals.css        # Global styles + CSS variables
│   ├── layout.tsx         # Root layout with Inter font
│   └── page.tsx           # Main application shell
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx    # Left navigation sidebar
│   │   └── Topbar.tsx     # Search bar + view controls
│   │
│   ├── dashboard/
│   │   ├── StatsCard.tsx  # Stats cards row
│   │   └── FilterBar.tsx  # Type filter + sort controls
│   │
│   ├── assets/
│   │   ├── AssetBadge.tsx # Colored type badges
│   │   ├── AssetCard.tsx  # Individual asset card
│   │   └── AssetGrid.tsx  # Main asset grid/list view
│   │
│   ├── inspector/
│   │   ├── AssetDetailPanel.tsx  # Right panel router
│   │   ├── AgentDetail.tsx       # Agent-specific view
│   │   ├── PromptDetail.tsx      # Prompt-specific view
│   │   ├── MarkdownDetail.tsx    # Markdown + preview
│   │   ├── ImageDetail.tsx       # Image detail view
│   │   ├── CodeDetail.tsx        # Code + line numbers
│   │   └── GenericDetail.tsx     # Fallback for other types
│   │
│   ├── forms/
│   │   └── NewAssetModal.tsx     # Create new asset modal
│   │
│   └── ui/
│       ├── CopyButton.tsx  # Copy with feedback
│       ├── Toast.tsx       # Toast notifications
│       └── Modal.tsx       # Base modal component
│
├── data/
│   └── mockAssets.ts      # 15 rich mock assets (all types)
│
├── hooks/
│   └── useFilteredAssets.ts  # Filtering + sorting logic
│
├── lib/
│   ├── utils.ts            # cn(), formatDate, asset type config
│   └── clipboard.ts        # Clipboard helper
│
├── stores/
│   └── useAppStore.ts      # Zustand global state
│
└── types/
    └── index.ts            # TypeScript type definitions
```

---

## Implemented Features

### Agent Quick Actions (Phase 3)

- ✅ **Run Agent** — Opens a modal where you enter a topic/input. Generates a structured local mock preview using the agent's system prompt, instructions, variables, and tools. **No external API is called.** Displays the preview in the modal with a "Copy Result" button. Real execution requires integrating a model provider (OpenAI, Anthropic, etc.).
- ✅ **Test** — Opens a validation modal. Enter test input and click "Run Test" to run a local configuration check: validates input, system prompt, instructions, variables, tools, and example output. Shows a pass/warn/fail checklist and overall status. **Local only — no API call.**
- ✅ **Copy All** — Copies the full structured asset as Markdown to the clipboard. Includes all fields: title, type, version, description, tags, tools, system prompt, instructions, variables, linked files, notes, example output, and metadata. Shows toast feedback. Reuses `assetToMarkdown()` from `lib/export.ts`.

> **Note:** When Ollama is enabled in Settings → Local AI, Run Agent uses real model generation. Without Ollama, a structured local mock preview is shown instead.

---

### Core (Phase 1)
- ✅ Full dark-mode dashboard layout matching spec mockup
- ✅ Sidebar with all 14 navigation sections + counts
- ✅ Top search bar with `Ctrl+K` / `Cmd+K` focus shortcut
- ✅ Filter bar (8 type filters + sort dropdown)
- ✅ Stats cards row (Total Assets, Agents, Prompts, Files, Copied Today, Templates)
- ✅ Asset grid with 15 mock assets across all types
- ✅ Asset cards with type badges, tool badges, tags, favorites, metadata
- ✅ Click-to-select cards with blue ring highlight
- ✅ Right inspector panel with type-specific detail views
- ✅ Copy buttons with "Copied!" feedback and toast notifications
- ✅ Favorite toggle (click star on card or press `F`)
- ✅ Search filtering (title, description, tags, tools, content)
- ✅ Type filtering via filter bar
- ✅ Sort by: Last Used, Newest, Most Copied, Most Used, A–Z, Updated
- ✅ View mode toggle (grid / list)
- ✅ "New Asset" modal with type selector + dynamic form fields
- ✅ Move to Trash / Restore / Permanent Delete with confirmation
- ✅ Empty Trash with "type DELETE to confirm"
- ✅ Export asset as `.md` from the inspector panel
- ✅ LocalStorage persistence via Zustand persist
- ✅ Keyboard shortcuts: `N` new asset, `Esc` close panel, `F` toggle favorite

### Auth & Identity (Phase 2)
- ✅ **Local-first login** — user profile stored in `localStorage` via Zustand persist
- ✅ **Session persistence** — `isLoggedIn` flag is separate from profile data; app opens instantly for returning users without re-entering details
- ✅ **No hydration flicker** — `_hasHydrated` flag prevents login screen flash while localStorage loads
- ✅ **Returning user flow** — "Continue as [Name]" button on login screen; "Use different account" to edit details
- ✅ **Logout** — keeps profile (prefills login next time); clears session only
- ✅ **Danger Zone** — "Clear All Data" resets assets, profile, settings, invites, and notifications after confirmation
- ✅ Prepared for future Supabase Auth: `login()` / `logout()` / `resumeSession()` in `useUserStore` map cleanly to Supabase `signInWithPassword` / `signOut` / `onAuthStateChange`

### Settings (Phase 2)
- ✅ Full settings page (Profile, Appearance, Library, Export & Backup, Team, Danger Zone)
- ✅ Accent color picker (Blue, Purple, Green, Orange) — changes apply app-wide instantly via CSS variables
- ✅ Library preferences: default sort, default view mode, show usage count, compact cards
- ✅ Export all assets as JSON or Markdown
- ✅ Import from JSON backup file
- ✅ Invite team members (locally saved, email-sending ready for Supabase)

### Advanced Filters (Phase 2)
- ✅ **Filters button** in the top bar opens a popover with:
  - Favorites-only toggle
  - Visibility filter (All / Private / Public / Team)
  - Tool filter (multi-select, OR logic — picks from your actual asset tools)
  - Tag filter (multi-select, OR logic — picks from your actual asset tags)
- ✅ Active filter count badge on the Filters button
- ✅ "Clear all" inside popover resets all advanced filters
- ✅ Filters are applied on top of the existing type + sort filters; all are local-first
- ✅ Future Supabase: filters would translate to server-side query predicates

### Notifications (Phase 2)
- ✅ **Bell icon** opens a notification popover
- ✅ Notifications are generated for: asset created, moved to trash, restored, permanently deleted, exported (JSON/MD), invite saved, profile updated
- ✅ Unread indicator dot on bell — only shown when unread notifications exist
- ✅ Mark individual or all notifications as read
- ✅ Clear all notifications
- ✅ Notifications persisted in `localStorage` (key: `promptvault-notifications`)
- ✅ Max 50 notifications kept (oldest discarded)
- ✅ Future Supabase: could use Supabase Realtime or a `notifications` table with `read_at`

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 + App Router | Framework + routing |
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | Global state + localStorage |
| Lucide React | Icons |
| clsx + tailwind-merge | Class utilities |

---

## Local AI — Ollama Integration (Phase 5)

Run agents locally against any model available in your Ollama instance. No data leaves your machine.

### Setup

1. Install Ollama: [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama3` (or any model)
3. Start Ollama (it runs at `http://localhost:11434` by default)
4. In PromptVault → Settings → **Local AI**: enable Ollama, set URL, click **Test Connection**

### How it works

- A Next.js API route (`/api/ollama/*`) proxies requests to Ollama to avoid CORS issues in the browser
- `lib/ollama.ts` — client helpers: `fetchOllamaModels`, `testOllamaConnection`, `generateWithOllama`
- `lib/modelSelector.ts` — auto-selects the best available model by task type (coding → `codellama`/`qwen-coder`; writing → `llama3`/`mistral`; reasoning → `llama3.1`/`qwen2.5`)
- `lib/promptBuilder.ts` — builds a structured `SYSTEM` + `PROMPT` pair from an agent's system prompt, instructions, variables, tools, and example output
- **RunAgentModal** — detects Ollama availability; runs real generation when enabled; falls back to mock preview on error
- **TestAgentModal** — runs local config validation as before, with an optional "Test with Ollama" panel that shows model, response time, and live output

### API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ollama/tags` | GET | List available models (proxies `/api/tags`) |
| `/api/ollama/generate` | POST | Generate a response (proxies `/api/generate`) |
| `/api/ollama/test` | GET | Test connectivity and return model count |

### Settings persisted

`enabled`, `baseUrl`, `autoSelect`, `preferredModel`, `models`, `lastCheckedAt` are stored in `localStorage` under the `promptvault-user` key alongside other user settings.

---

## Local Vault File Storage (Phase 6)

Save every asset as a real file on disk inside `<project-root>/vault/`. No cloud required. Works alongside localStorage.

### Folder structure

```
vault/
├── index.json          ← fast lookup map (no content, just metadata + paths)
├── agents/
├── prompts/
│   ├── image/
│   ├── video/
│   ├── text/
│   ├── code/
│   ├── music/
│   └── general/
├── markdown/
├── code/
├── workflows/
├── templates/
├── images/
├── exports/
├── backups/
│   └── YYYY-MM-DD/     ← one folder per day; backups created before any overwrite
└── .deleted/           ← permanently deleted files land here (never hard-deleted)
```

### File format

- **Agents, prompts, markdown, code, templates, notes** → `.md` with YAML frontmatter (`gray-matter`)
- **Workflows, JSON assets** → `.json`

Example agent file:
```markdown
---
id: abc123
type: agent
title: "SEO Content Writer"
tags: [writing, seo]
tools: [Claude, GPT-4]
version: "1.0.0"
visibility: private
status: active
---

## System Prompt
You are an expert SEO content writer...

## Instructions
1. Research the topic...
```

### Enabling the vault

Settings → **Vault Storage** tab:

1. Click **Initialize Vault** — creates folder structure + `index.json`
2. Click **Sync to Vault** — writes all active assets to disk
3. From now on every new asset, trash, restore, and permanent delete is automatically mirrored to disk

### Loading from vault

Click **Load from Vault** to merge the vault's assets back into the app. Assets already in the app (same ID) are skipped; new ones are added. A confirmation dialog shows the count before merging.

### API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/vault/init` | POST | Create folder structure + `index.json` if absent |
| `/api/vault/index` | GET / PUT | Read or overwrite `index.json` |
| `/api/vault/assets` | GET | List assets (`?full=true` includes file content) |
| `/api/vault/assets` | POST | Write new asset file + add to index |
| `/api/vault/assets/[id]` | GET | Read single asset file |
| `/api/vault/assets/[id]` | PUT | Backup + overwrite file + refresh index |
| `/api/vault/assets/[id]` | DELETE | Move to `.deleted/` + remove from index |
| `/api/vault/assets/[id]/trash` | POST | Mark `trashedAt` in index (file stays) |
| `/api/vault/assets/[id]/restore` | POST | Clear `trashedAt` in index |
| `/api/vault/rebuild-index` | POST | Scan folder structure and regenerate `index.json` |

### Key implementation details

- **Atomic writes** — `index.json` is written to a `.tmp` file then renamed to prevent corruption on crash
- **Backups before overwrite** — any `PUT` creates a timestamped backup in `vault/backups/YYYY-MM-DD/`
- **Soft delete only** — `DELETE` moves the file to `vault/.deleted/`; nothing is ever hard-deleted
- **Path traversal prevention** — all paths are resolved and checked to stay inside `vault/`
- **Fire-and-forget hooks** — vault writes are async and non-blocking; the app never waits for them
- **Server-only** — `lib/server/` files use Node.js `fs` and must never be imported from client components

---

## Supabase Integration Roadmap (Phase 3)

### Auth
Replace `useUserStore.login()` / `logout()` / `resumeSession()` with:
```ts
supabase.auth.signInWithPassword()
supabase.auth.signOut()
supabase.auth.onAuthStateChange()
```
Profile data moves to a `profiles` table (joined with `auth.users`).

### Database
- `assets` table with Row Level Security (user_id = auth.uid())
- `invites` table — email, role, token, accepted_at, created_by
- `user_settings` table — keyed by user_id
- `notifications` table — for cross-device sync (or use Supabase Realtime)

### Filters
Advanced filters (visibility, tags, tools) translate directly to Supabase query predicates or full-text search.

### Storage
- `asset-images/{user_id}/{asset_id}/`
- `asset-files/{user_id}/{asset_id}/`
- `exports/{user_id}/`

### Env variables needed
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Remaining work
- [x] Ollama local AI integration (Phase 5)
- [x] Local vault file storage (Phase 6)
- [ ] Markdown editor (CodeMirror or Monaco)
- [ ] Real syntax highlighting (highlight.js or Prism)
- [ ] Image upload + preview
- [ ] Version history
- [ ] Collections (group assets)
- [ ] Command palette (`Ctrl+K` full palette)
- [ ] Edit asset modal

---

## Supabase Schema (for Phase 2)

See `documents/PromptVault_SPEC.md` Section 7 for the complete SQL schema including:

- `assets` — main assets table
- `tags`, `asset_tags` — tagging system
- `tools`, `asset_tools` — tool associations
- `collections`, `collection_assets` — grouping
- `linked_assets` — asset relationships
- `asset_files` — file attachments
- `asset_versions` — version history

**Storage buckets to create:**
- `asset-images/{user_id}/{asset_id}/`
- `asset-files/{user_id}/{asset_id}/`
- `exports/{user_id}/`
- `backups/{user_id}/`

**Required env variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Color Palette

```css
--background: #070B14   /* Page background */
--surface: #0E1421      /* Card background */
--surface-soft: #121A2A /* Subtle elements */
--border: #243047       /* Borders */
--text-main: #F8FAFC    /* Primary text */
--text-muted: #94A3B8   /* Secondary text */
--accent-blue: #3B82F6  /* Primary action color */
--accent-violet: #7C3AED /* Agent/AI accent */
--accent-green: #22C55E  /* Success */
--accent-yellow: #FACC15 /* Warnings / markdown */
```
