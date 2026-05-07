# PromptVault – Produkt- och utvecklingsspecifikation

**Projekt:** PromptVault  
**Typ:** Universal AI Workspace / Prompt- och asset-manager  
**Rekommenderad projektmapp:** `C:\Projects\Active\PromptVault`  
**Status:** Planeringsspecifikation baserad på mockupbilden  
**Mål:** Bygga en snygg, snabb, lättnavigerad och genomtänkt app där användaren kan spara, organisera, köra, kopiera och återanvända AI-relaterade resurser.

---

## 1. Vision

PromptVault ska inte bara vara en app för prompts. Den ska fungera som ett personligt AI-kommandocenter där användaren kan samla:

- AI-agenter
- prompts
- bildprompts
- negativa prompts
- Markdown-filer
- kodsnippets
- workflows
- mallar
- bildreferenser
- JSON-konfigurationer
- länkar
- anteckningar
- resultat och exempeloutputs

Appen ska kännas som ett modernt, premiumbyggt arbetsverktyg för kreatörer, utvecklare och AI-användare.

Den ska vara:

- extremt lätt att förstå
- snabb att navigera
- visuellt snygg
- tydligt strukturerad
- enkel att bygga vidare på
- optimerad för snabbkopiering
- anpassad för framtida AI-funktioner

---

## 2. Rekommenderad teknikstack

### Frontend

Använd:

- **Next.js med App Router**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **lucide-react** för ikoner
- **Framer Motion** för mjuka animationer
- **Zustand** för enklare global UI-state
- **TanStack Query** för datahämtning och cache
- **React Hook Form + Zod** för formulär och validering

### Backend / datalager

För första riktiga versionen rekommenderas:

- **Supabase**
  - PostgreSQL-databas
  - Auth
  - Storage
  - Row Level Security
  - Edge Functions senare vid behov

### Filhantering

Använd Supabase Storage för:

- uppladdade bilder
- Markdown-filer
- JSON-filer
- referensbilder
- exports
- framtida backupfiler

### Lokal utveckling

Projektet placeras i:

```text
C:\Projects\Active\PromptVault
```

---

## 3. Varför denna stack?

### Next.js

Next.js passar bra eftersom appen kan byggas som en modern webbapp med tydlig filbaserad routing, React-komponenter, serverfunktioner och bra struktur för framtida expansion.

### TypeScript

TypeScript ska användas från början för att minska fel när datamodellen växer. Appen kommer hantera flera typer av assets, relationer, filter, taggar och metadata. Då blir typer viktigt.

### Tailwind CSS

Tailwind gör det enkelt att bygga en exakt, modern och mörk dashboard-design lik mockupbilden.

### shadcn/ui

shadcn/ui ska användas som grund för komponenter som:

- Button
- Card
- Dialog
- Sheet
- Tabs
- Badge
- Dropdown Menu
- Input
- Textarea
- Command
- ScrollArea
- Tooltip
- Switch
- Separator
- Form
- Select

Komponenterna ska stylas så de följer PromptVaults visuella identitet.

### Supabase

Supabase är bra eftersom appen behöver:

- databas
- användarkonton
- lagring av filer
- säkerhetsregler
- möjlighet att synka mellan datorer
- framtida team/delning
- relationsdata mellan assets, taggar, agenter och filer

---

## 4. Huvudfunktioner

## 4.1 Asset Library

Appen ska ha ett centralt bibliotek där alla resurser visas som kort.

Varje asset kan vara en av följande typer:

```ts
type AssetType =
  | "agent"
  | "prompt"
  | "image"
  | "markdown"
  | "code"
  | "workflow"
  | "template"
  | "json"
  | "link"
  | "note"
  | "other";
```

Varje asset ska kunna ha:

- titel
- beskrivning
- typ
- status
- favoritmarkering
- taggar
- verktyg
- kategori
- innehåll
- metadata
- kopieringsstatistik
- länkade filer
- versionshistorik
- skapad datum
- uppdaterad datum
- senast använd
- senast kopierad

---

## 4.2 Agents

En agent är en mer avancerad asset.

En agent ska kunna innehålla:

- namn
- beskrivning
- system prompt
- instruktioner
- variabler
- verktyg
- länkade filer
- exempeloutput
- modellinställningar
- version
- aktivitetslogg
- anteckningar
- snabbknappar

Exempel på agent:

```text
LinkedIn Content Agent
Typ: Agent
Verktyg: OpenAI, Web Search, DALL·E
Syfte: Skapa LinkedIn-inlägg, carousels och innehållsidéer.
```

Agentens detaljpanel ska visa:

- Overview
- Activity
- Versions
- Notes
- System Prompt
- Instructions
- Linked Files
- Markdown Notes
- Example Output
- Variables
- Tools
- Quick Actions

Snabbåtgärder:

- Run Agent
- Test with Input
- Copy System Prompt
- Copy Instructions
- Copy All
- Duplicate
- Edit

---

## 4.3 Prompts

En prompt-asset ska kunna innehålla:

- titel
- kort beskrivning
- huvudprompt
- negativ prompt
- inställningar
- variabler
- förväntat resultat
- exempelresultat
- AI-verktyg
- taggar
- anteckningar
- versioner

Exempel:

```text
Cinematic Portrait Template
Typ: Prompt
Verktyg: Midjourney
Taggar: cinematic, portrait, hyperrealistic
```

Snabbkopiering ska vara centralt:

- Copy Prompt
- Copy Negative
- Copy Settings
- Copy All

När användaren kopierar ska appen visa en liten bekräftelse:

```text
Copied!
```

---

## 4.4 Images och image sets

Appen ska kunna spara enskilda bilder och bildsamlingar.

En image asset ska kunna innehålla:

- bildfil
- titel
- beskrivning
- prompt som skapade bilden
- negativ prompt
- modell
- seed
- upplösning
- verktyg
- taggar
- anteckningar
- relaterade prompts

En image set kan innehålla flera bilder, till exempel:

```text
Moodboard Reference Pack
Brand Visual System
Character References
UI Inspiration Pack
```

---

## 4.5 Markdown Files

Appen ska kunna hantera Markdown-filer som förstaklass-assets.

En Markdown-fil ska kunna innehålla:

- filnamn, t.ex. `launch-plan.md`
- titel
- innehåll
- preview
- raw mode
- kopiera innehåll
- öppna/redigera
- taggar
- länkade assets

Markdown-vyn bör ha:

- editor
- preview
- split view
- copy markdown
- export `.md`

---

## 4.6 Code Snippets

Kodsnippets ska kunna sparas med:

- språk
- titel
- beskrivning
- kod
- taggar
- kopieringsknapp
- versionshistorik
- användningsanteckning

Exempel:

```text
ComfyUI Workflow Helper
Language: Python
Tags: comfyui, workflow, utilities
```

Stöd för språk:

- JavaScript
- TypeScript
- Python
- HTML
- CSS
- SQL
- JSON
- YAML
- Bash
- PowerShell
- C#
- annat

---

## 4.7 Workflows

Workflow-assets ska användas för flöden och processer.

Exempel:

```text
Publishing Pipeline
Tools: n8n, Notion, Slack
Purpose: Content creation, review and publishing.
```

En workflow ska kunna innehålla:

- steglista
- verktyg
- input
- output
- länkade filer
- status
- anteckningar
- kopierbar instruktion

---

## 4.8 Templates

Templates är återanvändbara mallar.

Exempel:

- Product Brief Template
- AI Agent Template
- Image Prompt Template
- Markdown Document Template
- Coding Task Template
- Social Media Post Template

En template ska kunna användas för att skapa nya assets snabbt.

Knapp:

```text
Use Template
```

---

## 5. UI-struktur enligt mockup

Appen ska använda tre huvudområden:

```text
┌──────────────────┬──────────────────────────────┬─────────────────────┐
│ Left Sidebar     │ Main Asset Library            │ Right Detail Panel  │
└──────────────────┴──────────────────────────────┴─────────────────────┘
```

---

## 5.1 Left Sidebar

Sidebar ska vara fast till vänster.

Innehåll:

- Logo: PromptVault
- Subtitle: Universal AI Workspace
- Button: + New Asset
- Navigation:
  - Dashboard
  - All Assets
  - Agents
  - Prompts
  - Images
  - Markdown Files
  - Code Snippets
  - Workflows
  - Collections
  - Templates
  - Recent
  - Favorites
  - Trash
  - Settings
- User profile card
- Storage usage
- Invite Team Members

Sidebar ska ha:

- aktiv state
- hover state
- ikoner
- små antal till höger
- tydlig separation mellan grupper

---

## 5.2 Topbar

Topbar ska innehålla:

- global sök
- kortkommandohint `/`
- shortcut hint `Ctrl+K` eller `⌘K`
- notification icon
- grid/list toggle
- filterknapp

Sökfältets placeholder:

```text
Search assets, agents, prompts, files, notes...
```

---

## 5.3 Filters

Filterraden ska innehålla:

- All Types
- All Tools
- All Tags
- All Collections
- Sort by: Last Used
- Filters

Filter ska kunna kombineras.

Exempel:

```text
Type = Agent
Tool = OpenAI
Tag = LinkedIn
Sort = Last Used
```

---

## 5.4 Stats Cards

Överst i huvudytan ska det finnas statistik:

- Total Assets
- Agents
- Prompts
- Files
- Copied Today
- Templates

Varje stats card ska visa:

- ikon
- titel
- siffra
- trendtext

Exempel:

```text
Total Assets
1,248
↑ 18% this week
```

---

## 5.5 Main Asset Grid

Griden ska visa blandade asset-kort.

Varje kort ska ha:

- ikon
- typbadge
- titel
- favoritstjärna
- beskrivning
- tool badges
- taggar
- status/metadata
- copy icon
- more menu
- selected state

Selected state ska synas med:

- blå/violett border
- lätt glow
- checkmark i hörnet

---

## 5.6 Right Detail Panel

Högerpanelen visar vald asset.

För Agent:

- titel
- typbadge
- version
- tools
- tabs
- system prompt
- instructions
- linked files
- markdown notes
- example output
- variables
- tools
- quick actions
- metadata

För Prompt:

- titel
- prompt
- negative prompt
- settings
- variables
- example result
- notes
- copy buttons

För Markdown:

- titel
- file info
- markdown preview
- raw markdown
- linked assets
- copy/open/export

För Image:

- bildpreview
- prompt
- metadata
- relaterade assets
- download/copy prompt

För Code:

- syntax-highlightad kod
- språk
- copy code
- notes
- versioner

---

## 6. Designsystem

## 6.1 Visuell känsla

Appen ska kännas:

- mörk
- premium
- modern
- lugn
- kreativ
- tydlig
- snabb
- teknisk men inte svår

## 6.2 Färger

Rekommenderade färger:

```css
--background: #070B14;
--surface: #0E1421;
--surface-soft: #121A2A;
--border: #243047;
--text-main: #F8FAFC;
--text-muted: #94A3B8;
--accent-blue: #3B82F6;
--accent-violet: #7C3AED;
--accent-green: #22C55E;
--accent-yellow: #FACC15;
--danger: #EF4444;
```

## 6.3 Layout

- Mörk bakgrund
- Rundade paneler
- 12–16 px border radius
- Soft shadows
- Subtila gradients
- Tydlig spacing
- Cards med hover state
- Smooth transitions

## 6.4 Typografi

Använd modern sans-serif.

Rekommenderat:

- Inter
- Geist Sans
- system font fallback

Exempel:

```css
font-family: Inter, Geist, system-ui, sans-serif;
```

## 6.5 Ikoner

Använd `lucide-react`.

Exempel på ikoner:

- LayoutDashboard
- Bot
- FileText
- Image
- Code2
- Workflow
- Star
- Copy
- MoreHorizontal
- Search
- Settings
- Trash
- Clock
- Tag
- Folder
- Play
- FlaskConical

---

## 7. Datamodell

## 7.1 Tabell: assets

```sql
create table assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  title text not null,
  description text,
  content text,
  negative_content text,
  settings jsonb default '{}',
  metadata jsonb default '{}',
  is_favorite boolean default false,
  is_template boolean default false,
  visibility text default 'private',
  version text default '1.0.0',
  usage_count integer default 0,
  copy_count integer default 0,
  last_used_at timestamptz,
  last_copied_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 7.2 Tabell: tags

```sql
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);
```

## 7.3 Tabell: asset_tags

```sql
create table asset_tags (
  asset_id uuid references assets(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (asset_id, tag_id)
);
```

## 7.4 Tabell: tools

```sql
create table tools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  type text,
  icon text,
  created_at timestamptz default now()
);
```

## 7.5 Tabell: asset_tools

```sql
create table asset_tools (
  asset_id uuid references assets(id) on delete cascade,
  tool_id uuid references tools(id) on delete cascade,
  primary key (asset_id, tool_id)
);
```

## 7.6 Tabell: linked_assets

```sql
create table linked_assets (
  id uuid primary key default gen_random_uuid(),
  source_asset_id uuid references assets(id) on delete cascade,
  target_asset_id uuid references assets(id) on delete cascade,
  relationship_type text default 'related',
  created_at timestamptz default now()
);
```

## 7.7 Tabell: asset_files

```sql
create table asset_files (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id) on delete cascade,
  user_id uuid not null,
  file_name text not null,
  file_type text not null,
  storage_path text not null,
  size_bytes bigint,
  created_at timestamptz default now()
);
```

## 7.8 Tabell: asset_versions

```sql
create table asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id) on delete cascade,
  version text not null,
  snapshot jsonb not null,
  created_at timestamptz default now()
);
```

## 7.9 Tabell: collections

```sql
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text,
  icon text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 7.10 Tabell: collection_assets

```sql
create table collection_assets (
  collection_id uuid references collections(id) on delete cascade,
  asset_id uuid references assets(id) on delete cascade,
  primary key (collection_id, asset_id)
);
```

---

## 8. Viktigt för Supabase

När databasen byggs ska följande kontrolleras:

- SQL-tabeller
- kolumner
- relationer
- indexes
- Row Level Security
- policies
- Storage buckets
- Storage policies
- schema reload
- auth-koppling mot `auth.users`

Alla tabeller som innehåller `user_id` ska skyddas med RLS så att användaren bara ser sina egna assets.

Exempelpolicy:

```sql
create policy "Users can read their own assets"
on assets for select
using (auth.uid() = user_id);
```

---

## 9. Storage buckets

Skapa buckets:

```text
asset-files
asset-images
exports
backups
```

Rekommenderad struktur i storage:

```text
asset-images/{user_id}/{asset_id}/image.png
asset-files/{user_id}/{asset_id}/file.md
exports/{user_id}/promptvault-export.json
backups/{user_id}/backup-2026-05-06.json
```

---

## 10. Routes / sidor

Använd Next.js App Router.

Föreslagen struktur:

```text
app/
├── layout.tsx
├── page.tsx
├── dashboard/
│   └── page.tsx
├── assets/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── agents/
│   └── page.tsx
├── prompts/
│   └── page.tsx
├── images/
│   └── page.tsx
├── markdown/
│   └── page.tsx
├── code/
│   └── page.tsx
├── workflows/
│   └── page.tsx
├── collections/
│   └── page.tsx
├── templates/
│   └── page.tsx
├── settings/
│   └── page.tsx
└── trash/
    └── page.tsx
```

Första versionen kan börja med en enda sida:

```text
app/page.tsx
```

Men komponenterna ska ändå delas upp rätt från början.

---

## 11. Rekommenderad projektstruktur

```text
C:\Projects\Active\PromptVault
│
├── app
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components
│   ├── layout
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── RightPanel.tsx
│   │
│   ├── assets
│   │   ├── AssetCard.tsx
│   │   ├── AssetGrid.tsx
│   │   ├── AssetBadge.tsx
│   │   ├── AssetDetailPanel.tsx
│   │   ├── AgentDetail.tsx
│   │   ├── PromptDetail.tsx
│   │   ├── MarkdownDetail.tsx
│   │   ├── ImageDetail.tsx
│   │   └── CodeDetail.tsx
│   │
│   ├── dashboard
│   │   ├── StatsCard.tsx
│   │   └── FilterBar.tsx
│   │
│   ├── forms
│   │   ├── AssetForm.tsx
│   │   ├── AgentForm.tsx
│   │   └── PromptForm.tsx
│   │
│   └── ui
│
├── lib
│   ├── supabase
│   │   ├── client.ts
│   │   └── server.ts
│   ├── clipboard.ts
│   ├── asset-types.ts
│   ├── mock-data.ts
│   └── utils.ts
│
├── hooks
│   ├── useAssets.ts
│   ├── useClipboard.ts
│   └── useFilters.ts
│
├── stores
│   └── useAppStore.ts
│
├── types
│   └── index.ts
│
├── supabase
│   ├── migrations
│   └── seed.sql
│
├── public
│   └── mockups
│
├── docs
│   └── PromptVault_SPEC.md
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 12. Komponenter

## 12.1 AppShell

Ansvar:

- sidlayout
- sidebar
- topbar
- main area
- right panel

## 12.2 Sidebar

Ansvar:

- navigation
- aktiv route
- counts
- new asset button
- profile card

## 12.3 AssetGrid

Ansvar:

- rendera asset-kort
- grid/list mode
- tomt läge
- pagination

## 12.4 AssetCard

Ansvar:

- visa assetens typ
- titel
- beskrivning
- badges
- taggar
- metadata
- favorite
- quick copy
- menu
- selected state

## 12.5 AssetDetailPanel

Ansvar:

- välja rätt detaljkomponent baserat på asset type

```tsx
if (asset.type === "agent") return <AgentDetail asset={asset} />;
if (asset.type === "prompt") return <PromptDetail asset={asset} />;
if (asset.type === "markdown") return <MarkdownDetail asset={asset} />;
if (asset.type === "image") return <ImageDetail asset={asset} />;
if (asset.type === "code") return <CodeDetail asset={asset} />;
```

---

## 13. Clipboard-funktion

Clipboard ska vara en kärnfunktion.

Skapa helper:

```ts
export async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}
```

Vid kopiering:

- kopiera rätt text
- uppdatera `copy_count`
- uppdatera `last_copied_at`
- visa toast
- animera knapp kort

Toast-exempel:

```text
Prompt copied
Instructions copied
Markdown copied
Code copied
Everything copied
```

---

## 14. Sök och filter

Sök ska gå mot:

- title
- description
- content
- tags
- tools
- notes
- file names

Filter:

- type
- tool
- tag
- collection
- favorite
- template
- date
- usage
- last copied
- last used

Sortering:

- Last Used
- Newest
- Most Copied
- Most Used
- A–Z
- Updated

---

## 15. Kortkommandon

Lägg in tangentbordsstöd:

```text
Ctrl+K / Cmd+K   Global search
N                New asset
C                Copy selected main content
E                Edit selected asset
F                Toggle favorite
Esc              Close modal/detail
/                Focus search
```

---

## 16. States

Varje asset kan ha:

```ts
type AssetStatus =
  | "active"
  | "draft"
  | "archived"
  | "paused"
  | "trash";
```

---

## 17. Import och export

Appen ska kunna exportera:

- hela biblioteket som JSON
- valda assets som JSON
- prompts som Markdown
- Markdown-filer som `.md`
- kodsnippets som filer
- backup zip senare

Import ska kunna ta emot:

- JSON
- Markdown
- text
- CSV senare

---

## 18. MVP – första versionen

Första versionen ska inte försöka göra allt.

MVP ska innehålla:

- snygg layout enligt mockup
- sidebar
- topbar
- filterbar visuellt
- stats cards
- asset grid
- right detail panel
- mockdata
- skapa ny asset lokalt
- redigera asset
- radera asset
- favoritmarkera
- snabbkopiera
- sök lokalt
- filter på typ
- localStorage eller mockdata först
- Supabase kopplas in efter att UI sitter

MVP ska stödja dessa asset-typer:

- Agent
- Prompt
- Markdown
- Image
- Code
- Workflow
- Template

---

## 19. Fas 2

När MVP fungerar:

- Supabase Auth
- Supabase Database
- Supabase Storage
- riktig CRUD
- RLS policies
- filuppladdning
- Markdown editor
- image preview
- versionshistorik
- collections
- import/export

---

## 20. Fas 3

Senare:

- AI som förbättrar prompts
- AI som kategoriserar assets
- AI som skapar tags
- AI som gör promptvarianter
- agent runner
- teamdelning
- public/private assets
- browser extension
- command palette
- fulltext search
- vector search
- embeddings
- marketplace-liknande delningsyta

---

## 21. Mockdata för första bygget

Skapa initial mockdata med:

```ts
export const mockAssets = [
  {
    id: "1",
    type: "agent",
    title: "LinkedIn Content Agent",
    description: "Creates engaging LinkedIn posts, carousels, and audience-focused content.",
    tools: ["OpenAI", "Web Search", "DALL·E 3"],
    tags: ["linkedin", "content", "social"],
    isFavorite: true,
    updatedAt: "2h ago"
  },
  {
    id: "2",
    type: "prompt",
    title: "Cinematic Portrait Template",
    description: "Ultra-realistic cinematic portrait with dynamic lighting and rich detail.",
    tools: ["Midjourney"],
    tags: ["cinematic", "portrait", "hyperrealistic"],
    isFavorite: true,
    updatedAt: "3h ago"
  },
  {
    id: "3",
    type: "markdown",
    title: "launch-plan.md",
    description: "Go-to-market launch plan with milestones, audience, and messaging.",
    tools: ["Markdown"],
    tags: ["product", "launch", "strategy"],
    isFavorite: true,
    updatedAt: "6h ago"
  }
];
```

---

## 22. Viktiga UX-principer

Appen ska alltid prioritera:

1. snabbhet
2. tydlighet
3. enkel kopiering
4. få klick
5. visuell ordning
6. tydliga kategorier
7. lätt sök
8. säkra ändringar
9. inga röriga formulär
10. möjlighet att växa

---

## 23. Skapa asset-flöde

När användaren klickar på `+ New Asset`:

Visa modal/sheet med val:

- Agent
- Prompt
- Markdown File
- Image
- Code Snippet
- Workflow
- Template
- JSON/File
- Other

Därefter visas relevant formulär.

Exempel:

Agent-formulär:

- Name
- Description
- System Prompt
- Instructions
- Tools
- Variables
- Tags
- Linked Files
- Example Output

Prompt-formulär:

- Title
- Description
- Prompt
- Negative Prompt
- Settings
- Tool
- Tags
- Notes

Markdown-formulär:

- File name
- Title
- Content
- Tags
- Linked assets

---

## 24. Säkerhet

När Supabase kopplas in:

- aktivera RLS på alla tabeller
- koppla varje asset till user_id
- validera input med Zod
- tillåt bara uppladdning av godkända filtyper
- använd privata storage buckets först
- logga inte hemliga API-nycklar i databasen
- separera agent-konfiguration från känsliga tokens

---

## 25. Prestanda

Tänk på:

- pagination
- lazy loading
- virtualiserad lista senare
- optimistisk uppdatering vid favorit/copy
- caching med TanStack Query
- små komponenter
- undvik onödiga rerenders
- ladda bara detail panel för vald asset

---

## 26. Tillgänglighet

Appen ska ha:

- tydliga kontraster
- focus states
- keyboard navigation
- aria labels på icon buttons
- inte bara färg för att visa status
- läsbara fontstorlekar
- tooltips på ikoner

---

## 27. Responsiv design

Desktop är huvudfokus.

Men appen ska fungera på:

- laptop
- större skärm
- tablet

På mindre skärm:

- sidebar kan kollapsa
- right panel kan bli drawer
- grid går från 3 kolumner till 1–2 kolumner

---

## 28. Namn och språk

Appnamn:

```text
PromptVault
```

Tagline:

```text
Universal AI Workspace
```

UI-språk i appen:

- engelska från start
- svensk version kan läggas till senare

---

## 29. Exempel på detaljpanel för vald agent

```text
LinkedIn Content Agent

Badges:
Agent
v1.4.2
OpenAI
Web Search
DALL·E 3

Tabs:
Overview
Activity
Versions
Notes

System Prompt:
You are a LinkedIn content expert that creates engaging,
value-driven posts tailored to the target audience.
Focus on clarity, authenticity, and actionable insights.

Instructions:
1. Analyze the topic and target audience.
2. Write a hook that grabs attention.
3. Provide key insights with examples or data.
4. End with a CTA that drives engagement.
5. Optimize for readability and LinkedIn best practices.

Linked Files:
- launch-plan.md
- LinkedIn-Moodboard.png
- agent-config.json

Quick Actions:
- Run Agent
- Test with Input
- Copy All
```

---

## 30. Viktig byggregel

Bygg inte allt på en gång.

Prioriterad ordning:

1. Statisk UI från mockup
2. Mockdata
3. Selected asset state
4. Copy buttons
5. Search/filter lokalt
6. New/Edit/Delete lokalt
7. LocalStorage
8. Supabase schema
9. Supabase CRUD
10. Storage
11. Auth
12. Agent runner

---

## 31. Definition of Done för MVP

MVP är klar när:

- appen startar utan fel
- layouten matchar mockupens känsla
- sidebar fungerar visuellt
- asset grid visar blandade assets
- högerpanelen visar vald asset
- det går att välja asset
- det går att kopiera innehåll
- det går att favoritmarkera
- det går att söka
- det går att filtrera på typ
- det går att skapa en enkel asset
- det går att redigera en asset
- det går att radera en asset
- data sparas lokalt eller i Supabase
- UI känns snabbt och stabilt

---

## 32. Sammanfattning

PromptVault ska byggas som ett modernt AI workspace för allt användaren återanvänder i sitt AI-arbete.

Det är inte bara:

```text
en promptlista
```

Det är:

```text
ett organiserat bibliotek för agenter, prompts, bilder, markdown-filer,
kodsnippets, workflows, mallar, konfigurationer och AI-resurser.
```

Appen ska börja enkel, men arkitekturen ska redan från start stödja större funktioner senare.

Det viktigaste i första versionen är:

- snygg layout
- tydlig navigering
- snabbkopiering
- blandade asset-typer
- bra detaljpanel
- enkel datamodell
- stabil grund för Supabase senare
