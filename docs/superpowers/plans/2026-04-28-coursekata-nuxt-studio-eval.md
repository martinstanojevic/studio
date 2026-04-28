# CourseKata × Nuxt Studio Fit Evaluation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Nuxt 4 + `@nuxt/content` v3 + Nuxt UI v4 prototype that pulls markdown content from the [`martinstanojevic/studio-content`](https://github.com/martinstanojevic/studio-content) GitHub repo, presents a filterable instructor catalog and resource detail page, and is ready to be connected to `studio.nuxt.com` for content editing — so the team can evaluate whether Nuxt Studio is a viable CMS for the eventual production CourseKata Teaching Resources site.

**Architecture:** Two-repo split. App repo (this repo) owns the schema, pages, and components. Content repo owns the markdown files. `@nuxt/content` v3's GitHub source pulls content into the app's local SQLite store at build/dev. Studio is connected to the **content** repo so all editor commits land there. Filter, sort, and search state lives in URL query params; initial render is SSR with filters applied server-side; subsequent changes are client-side for instant feedback.

**Tech Stack:** Nuxt 4 (`nuxt@4.4.2`), `@nuxt/content` v3 (`3.13.0`, with GitHub source), Nuxt UI v4 (`@nuxt/ui@4.7.0` — supports Nuxt 4), TypeScript, Zod (via `@nuxt/content`'s re-export), `nuxt-studio` (`1.6.1` — the current Nuxt Studio module; the older `@nuxthq/studio` package was archived 2025-09 and superseded).

**Source spec:** [`docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md`](../specs/2026-04-28-coursekata-nuxt-studio-eval-design.md)

**Note on testing:** This is an evaluation prototype. Per the spec, there are no automated tests. Each task ends with a manual verification step (browser, dev server output, or `git log`) followed by a commit. If any task uncovers behavior worth investigating later, capture it as an eval finding rather than a fix.

**Note on GPG signing:** The repo has commit signing disabled in earlier commits via `-c commit.gpgsign=false`. If the executor's environment has GPG configured and signing succeeds, plain `git commit` works. If signing fails, ask the user before bypassing — do not silently disable signing.

---

## File Structure

**App repo (this repo) — files this plan creates or modifies:**

| Path | Purpose |
|---|---|
| `package.json` | Scaffolded by `nuxi init`; dependencies pinned in Task 2 |
| `nuxt.config.ts` | Registers `@nuxt/content`, Nuxt UI, and the Studio module |
| `content.config.ts` | Zod schema + GitHub source config for `resources` collection |
| `app.config.ts` | Site-level editable settings (title, hero copy, footer) |
| `app/app.vue` | Root layout — header + `<NuxtPage />` |
| `app/pages/index.vue` | Catalog page — filters, sort, search, card grid |
| `app/pages/resources/[slug].vue` | Resource detail / preview page |
| `app/components/ResourceCard.vue` | Single card in the catalog grid |
| `app/components/ResourceFilters.vue` | Faceted filter sidebar |
| `app/components/ResourceSort.vue` | Sort dropdown |
| `app/composables/useResourceFilters.ts` | URL ↔ reactive filter state |
| `app/utils/filterResources.ts` | Pure filter/sort/search function over an array of resources |
| `app/types/resource.ts` | `Resource` TypeScript type derived from the schema |
| `README.md` | Dev instructions — local run, Studio connection steps |
| `.env.example` | Template for the GitHub auth token consumed by `content.config.ts` (no Nuxt-defined env var name; we pick `GITHUB_TOKEN`) |

**Content repo (`martinstanojevic/studio-content`) — files this plan creates:**

| Path | Purpose |
|---|---|
| `resources/*.md` | 10 sample resources — frontmatter (per schema) + markdown body |
| `README.md` | Note that this repo is content-only, edited via `studio.nuxt.com` |

---

## Task 1: Verify package names, versions, and APIs against live docs

**Why this is first:** Nuxt renamed several packages during the v3→v4 transition; `@nuxt/content` v3's GitHub source API and the Studio module's package name should be confirmed from current docs before installation rather than guessed.

**Files:**
- None yet — produce verification notes in the conversation, then update Task 2's commands if anything has changed.

- [ ] **Step 1: Fetch the current `@nuxt/content` v3 docs**

Run:

```bash
# These URLs are the canonical entry points; if any 404, search for the current location.
echo "https://content.nuxt.com/docs/getting-started/installation"
echo "https://content.nuxt.com/docs/collections/sources"
```

Use WebFetch on both URLs. From the output, confirm:
- The exact `npm install` command and version range for `@nuxt/content` v3.
- The shape of the `source` config for a remote GitHub repository in `defineCollection`. Specifically: are the keys `repository` and `include`, or are they named differently (e.g. `name`/`url`/`pattern`)? Whether a `branch` field is supported.
- Whether a GitHub access token is required for **public** repos in the GitHub source, and which env var name is expected (`NUXT_CONTENT_GITHUB_TOKEN`, `GITHUB_TOKEN`, etc.).

- [ ] **Step 2: Fetch the current Nuxt Studio module docs**

Run:

```bash
echo "https://content.nuxt.com/docs/studio/setup"
echo "https://nuxt.studio/docs"
```

WebFetch both. Confirm:
- Exact npm package name for the Studio module (historical candidates: `@nuxthq/studio`, `@nuxtlabs/studio-module`, or rolled into `@nuxt/content` itself).
- Whether the module needs to be added to `nuxt.config.ts`'s `modules` array, or auto-registers when `@nuxt/content` v3 is present.
- Whether the schema must be mirrored into the content repo (e.g. as `nuxt.schema.ts`) for Studio to render forms when the content repo and app repo are separate.

- [ ] **Step 3: Verify Nuxt 4 is current**

Run: `npm view nuxt version`
Expected: a `4.x.y` version string. If it's still `3.x`, use Nuxt 3 throughout the plan and adjust the directory layout accordingly (Nuxt 3 uses top-level `pages/` instead of `app/pages/`).

- [ ] **Step 4: Verify Nuxt UI v3 is current**

Run: `npm view @nuxt/ui version`
Expected: a `3.x.y` version string (v3 supports Nuxt 4). Note any breaking changes called out in the docs since v2.

- [ ] **Step 5: Record findings**

Update the **Verified versions** subsection below with the resolved values before proceeding to Task 2. If any default in this plan (e.g. the `source` syntax in Task 3, the module name in Task 2) conflicts with the live docs, edit that task in place — the plan is the source of truth, and the executor is allowed to amend it inline when verification reveals a divergence.

**Verified versions** (filled 2026-04-28; sources: `npm view`, `content.nuxt.com/docs/*`, `nuxt.studio/raw/setup.md`, archived `github.com/nuxtlabs/studio-module` README):

```
nuxt:           4.4.2
@nuxt/content:  3.13.0
@nuxt/ui:       4.7.0   (v4 is current; supports Nuxt 4. Plan originally said "v3" — corrected.)
Studio module:  nuxt-studio@1.6.1
                (NOT @nuxthq/studio — that package is archived as of 2025-09-24 and
                its README states "deprecated as it has been integrated in Nuxt
                Content version 3". The current module is published as `nuxt-studio`
                under the nuxt-content GitHub org.)
GitHub-source token env var:
                None defined by @nuxt/content. The docs only show the in-config shape:
                  source: { repository: { url, auth: { username, token } } }
                Token is read in content.config.ts via process.env.<NAME_WE_PICK>.
                We standardize on GITHUB_TOKEN in this plan.
                (Separately, the Studio module uses STUDIO_GITHUB_TOKEN at runtime
                for publishing — that is for Studio, not for the build-time content
                fetch.)
Schema-mirroring requirement for split repos:
                Not addressed by the docs. The Studio "Setup" guide assumes one repo
                where the Nuxt app and the markdown both live. There is no documented
                story for "schema in App repo, markdown in Content repo, Studio
                connected to Content repo". This is therefore a known unknown for the
                evaluation — captured as a verification step in Task 16, Step 2.
```

**Source config keys for GitHub** (verified — no change needed in Task 3):
```ts
source: {
  repository: 'https://github.com/owner/repo',  // string form OR
  repository: { url, branch, auth: { username, token } },  // object form
  include: 'path/glob/**/*.md',
}
```
`branch` lives **inside** the `repository` object form, not as a top-level key.

- [ ] **Step 6: Commit the verified values into the plan**

```bash
git add docs/superpowers/plans/2026-04-28-coursekata-nuxt-studio-eval.md
git commit -m "Pin verified package versions in implementation plan"
```

---

## Task 2: Scaffold the Nuxt 4 app

**Files:**
- Create: `package.json`, `nuxt.config.ts`, `tsconfig.json`, `app/app.vue` (all via `nuxi init`)

- [ ] **Step 1: Scaffold with `nuxi init`**

Run from the project root (`/Users/martinstanojevic/projects/studio`):

```bash
npx nuxi@latest init . --packageManager npm --gitInit false --force
```

`--force` allows scaffolding into a non-empty directory (the design doc and source spec already exist). `--gitInit false` keeps the existing repo's history.

Expected output: scaffolded files including `package.json`, `nuxt.config.ts`, `app/app.vue`, `tsconfig.json`. If `nuxi` insists on a clean directory, scaffold into a temporary directory (`/tmp/studio-scaffold`) and copy the files in manually, preserving the existing `.git`, `docs/`, `.gitignore`, and the source spec markdown.

- [ ] **Step 2: Install runtime dependencies**

Verified package names from Task 1:

```bash
npm install @nuxt/content @nuxt/ui tailwindcss nuxt-studio
```

`nuxt-studio` (NOT the archived `@nuxthq/studio`) is the current Nuxt Studio module. The Studio docs recommend `npx nuxt module add nuxt-studio` as an equivalent shorthand that also wires the modules-array entry — either approach is fine; doing it manually keeps the lockfile diff smaller.

- [ ] **Step 3: Register modules in `nuxt.config.ts`**

Open `nuxt.config.ts` and replace its contents with:

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-04-28',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    'nuxt-studio',
  ],
  content: {
    // Build-time GitHub source. Token is supplied via content.config.ts auth.token,
    // which reads process.env.GITHUB_TOKEN. There is no @nuxt/content-defined env var
    // name — we pick GITHUB_TOKEN for compatibility with GitHub CLI conventions.
  },
  studio: {
    // Studio publishes commits to the *content* repo, not this app repo.
    repository: {
      provider: 'github',
      owner: 'martinstanojevic',
      repo: 'studio-content',
      branch: 'main',
    },
  },
  css: ['~/assets/css/main.css'],
})
```

Note: the Studio docs allow Studio to auto-detect `owner`/`repo`/`branch` from CI env vars on Vercel/Netlify/GitHub Actions/GitLab CI. The explicit `studio.repository` block above is what makes Studio publish to the **content** repo when the app is deployed somewhere whose CI env points at the **app** repo (which is the split-repo case for this eval).

- [ ] **Step 4: Create `assets/css/main.css` for Nuxt UI**

Path: `assets/css/main.css`

```css
@import "tailwindcss";
@import "@nuxt/ui";
```

This is the Nuxt UI v4 entry (the v3/v4 install flow is the same: install `@nuxt/ui` and `tailwindcss`, register the module, import the two CSS layers).

- [ ] **Step 5: Replace `app/app.vue` with a minimal layout**

```vue
<template>
  <UApp>
    <header class="border-b border-default">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="font-semibold text-lg">
          {{ $appConfig.site?.title ?? 'CourseKata Resources' }}
        </NuxtLink>
        <UButton
          to="https://studio.nuxt.com"
          target="_blank"
          variant="ghost"
          size="sm"
          icon="i-lucide-pencil"
        >
          Edit in Studio
        </UButton>
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
  </UApp>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
</script>
```

- [ ] **Step 6: Run the dev server and verify it starts**

```bash
npm run dev
```

Expected: server starts on http://localhost:3000 (or 3001 if 3000 is taken). The page should render the header with the default site title and an "Edit in Studio" button. There should be no console errors. Stop the server with Ctrl-C.

If you see a "Cannot find module" error, re-check that all installs from Step 2 succeeded.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "Scaffold Nuxt 4 app with Nuxt Content, Nuxt UI, and Studio module"
```

---

## Task 3: Define the content schema and GitHub source

**Files:**
- Create: `content.config.ts`
- Create: `app/types/resource.ts`

- [ ] **Step 1: Create `content.config.ts`**

Path: `content.config.ts` (project root)

```ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    resources: defineCollection({
      type: 'page',
      source: {
        // Object form so we can attach auth (and pin a branch if needed).
        // The string-form `repository: 'https://github.com/owner/repo'` also works
        // for unauthenticated public access, but anonymous GitHub API requests
        // are rate-limited (60/hr per IP), which trips up `npm run dev` quickly.
        repository: {
          url: 'https://github.com/martinstanojevic/studio-content',
          branch: 'main',
          auth: {
            // GitHub PAT auth uses the token as the password and any non-empty
            // username — the GitHub API ignores the username for token auth.
            username: 'token',
            token: process.env.GITHUB_TOKEN ?? '',
          },
        },
        include: 'resources/**/*.md',
      },
      schema: z.object({
        title: z.string(),
        shortDescription: z.string(),
        whatStudentsDo: z.string(),

        type: z.enum(['JNB', 'Worksheet', 'Slide deck', 'Activity', 'Assessment', 'Reading']),
        jnbSubtype: z.string().optional(),
        function: z.enum(['Teaching', 'Assessment', 'Practice', 'Discussion', 'Project']),
        modality: z.enum(['Online', 'Paper-based', 'Hybrid']),
        coverage: z.enum(['Page', 'Section', 'Chapter', 'Book', 'Concept']),

        textbookVersions: z.array(z.string()),
        learningGoals: z.array(z.string()),
        topicTags: z.array(z.string()),

        lengthMinutes: z.number(),
        extraMaterialsNeeded: z.boolean(),
        extraMaterialsList: z.array(z.string()).optional(),
        studentDataCollectionRequired: z.boolean(),

        dataset: z.object({
          name: z.string(),
          source: z.string(),
          variableCount: z.number(),
          variableTypes: z.array(z.enum(['numeric', 'categorical', 'ordinal', 'datetime', 'text'])),
          topicTags: z.array(z.string()),
        }).optional(),

        lastUpdated: z.string(), // ISO date string; Studio handles dates better as strings
      }),
    }),
  },
})
```

Source config keys (`repository`, `include`, optional inner `branch`/`auth`) are verified against the live `@nuxt/content` v3 docs in Task 1.

- [ ] **Step 2: Create the TypeScript type for `Resource`**

Path: `app/types/resource.ts`

```ts
import type { z } from '@nuxt/content'

// Re-derive from the schema for components to consume.
// We reconstruct the type here rather than importing from content.config.ts
// because the latter is a build config and importing it into runtime code
// pulls config-only modules into the client bundle.
export interface ResourceFrontmatter {
  title: string
  shortDescription: string
  whatStudentsDo: string
  type: 'JNB' | 'Worksheet' | 'Slide deck' | 'Activity' | 'Assessment' | 'Reading'
  jnbSubtype?: string
  function: 'Teaching' | 'Assessment' | 'Practice' | 'Discussion' | 'Project'
  modality: 'Online' | 'Paper-based' | 'Hybrid'
  coverage: 'Page' | 'Section' | 'Chapter' | 'Book' | 'Concept'
  textbookVersions: string[]
  learningGoals: string[]
  topicTags: string[]
  lengthMinutes: number
  extraMaterialsNeeded: boolean
  extraMaterialsList?: string[]
  studentDataCollectionRequired: boolean
  dataset?: {
    name: string
    source: string
    variableCount: number
    variableTypes: ('numeric' | 'categorical' | 'ordinal' | 'datetime' | 'text')[]
    topicTags: string[]
  }
  lastUpdated: string
}

// Nuxt Content's queryCollection adds these to every doc:
export interface Resource extends ResourceFrontmatter {
  path: string         // e.g. "/resources/histogram-exploration"
  stem: string         // e.g. "resources/histogram-exploration"
  body?: unknown       // parsed MDC AST — used by <ContentRenderer>
}
```

- [ ] **Step 3: Create `.env.example`**

Path: `.env.example`

```
# GitHub Personal Access Token used by content.config.ts at build/dev time
# to fetch markdown from martinstanojevic/studio-content via @nuxt/content's
# GitHub source. Without it, anonymous GitHub API requests are limited to
# 60/hr per IP, which is too low for a `npm run dev` loop.
# Fine-grained PAT with read access to the studio-content repo is sufficient;
# classic tokens with `public_repo` scope also work.
GITHUB_TOKEN=
```

`GITHUB_TOKEN` is our choice — `@nuxt/content` does not define a specific env var name. Add `.env.example` to git but keep `.env` itself in `.gitignore` (already there from the initial repo setup).

- [ ] **Step 4: Sanity-check that `content.config.ts` parses**

```bash
npm run dev
```

Expected: dev server starts without schema errors. Until the content repo exists, the catalog will be empty — that's fine. We just want no parse errors. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add content.config.ts app/types/resource.ts .env.example
git commit -m "Add resources collection schema with GitHub source"
```

---

## Task 4: Create and seed the content repo

**Files (in `martinstanojevic/studio-content`):**
- Create: `README.md`, `resources/*.md` (10 files)

This task is performed in a **separate working directory** from the app repo, since it's a different GitHub repo.

- [ ] **Step 1: Confirm or create the content repo**

Ask the user: "Does the GitHub repo `martinstanojevic/studio-content` already exist?"

If no, run:

```bash
gh repo create martinstanojevic/studio-content --public --description "CourseKata Studio eval — content only" --confirm
```

If `gh` is not installed or not authenticated: ask the user to create the repo manually via the GitHub UI, then continue.

- [ ] **Step 2: Clone the content repo into a sibling directory**

```bash
cd /Users/martinstanojevic/projects
git clone https://github.com/martinstanojevic/studio-content.git
cd studio-content
```

- [ ] **Step 3: Add a content-repo README**

Path: `README.md` (in the content repo)

```markdown
# CourseKata Studio Content

This repository contains the markdown source for CourseKata teaching resources, edited via [Nuxt Studio](https://studio.nuxt.com).

- One file per resource under `resources/`.
- Schema is defined in the consuming app repo's `content.config.ts`.
- Do not edit other files by hand — use Studio.
```

- [ ] **Step 4: Create the 10 sample resource files**

Create each file under `resources/` with the path and frontmatter listed in the table below. Bodies use the template that follows the table.

**Frontmatter values per file:**

| File | type | jnbSubtype | function | modality | coverage | textbookVersions | lengthMinutes | extraMaterialsNeeded | studentDataCollectionRequired | hasDataset |
|---|---|---|---|---|---|---|---|---|---|---|
| `histogram-characters.md` | JNB | Exploration | Teaching | Online | Section | `["ABC v5.0","ABC v6.0"]` | 45 | false | false | yes |
| `linear-models-worksheet.md` | Worksheet | — | Practice | Paper-based | Chapter | `["ABC v6.0"]` | 30 | true | false | yes |
| `intro-statistics-deck.md` | Slide deck | — | Teaching | Hybrid | Book | `["ABC v5.0","ABC v6.0"]` | 60 | false | false | no |
| `dice-rolling-activity.md` | Activity | — | Teaching | Paper-based | Section | `["ABC v6.0"]` | 25 | true | true | no |
| `chapter-3-quiz.md` | Assessment | — | Assessment | Online | Chapter | `["ABC v6.0"]` | 20 | false | false | yes |
| `causal-inference-reading.md` | Reading | — | Teaching | Online | Concept | `["ABC v5.0","ABC v6.0"]` | 40 | false | false | no |
| `model-comparison-jnb.md` | JNB | Practice | Practice | Online | Section | `["ABC v6.0"]` | 50 | false | false | yes |
| `confidence-intervals-jnb.md` | JNB | Discussion | Discussion | Online | Concept | `["ABC v5.0"]` | 35 | false | false | yes |
| `data-collection-project.md` | Activity | — | Project | Hybrid | Book | `["ABC v6.0"]` | 90 | true | true | no |
| `final-exam-review.md` | Assessment | — | Assessment | Paper-based | Book | `["ABC v6.0"]` | 75 | true | false | yes |

**Body template** (use for every file, customizing the prose to match the title):

```markdown
---
title: <Human-readable title>
shortDescription: <One-sentence summary, e.g. "Students fit a histogram to characters data and reason about variation.">
whatStudentsDo: <One-sentence description of student activity>
type: <from table>
jnbSubtype: <from table, omit if not JNB>
function: <from table>
modality: <from table>
coverage: <from table>
textbookVersions: <from table>
learningGoals:
  - <one specific learning goal>
  - <one specific learning goal>
  - <one specific learning goal>
topicTags:
  - <topic tag>
  - <topic tag>
lengthMinutes: <from table>
extraMaterialsNeeded: <from table>
extraMaterialsList:  # only when extraMaterialsNeeded is true; otherwise omit
  - <e.g. "scissors", "graph paper">
studentDataCollectionRequired: <from table>
dataset:  # only when hasDataset = yes; otherwise omit the entire block
  name: <Dataset name>
  source: <Citation, URL, or "Synthetic — see notes">
  variableCount: <number>
  variableTypes:
    - <one of: numeric, categorical, ordinal, datetime, text>
  topicTags:
    - <e.g. "demographics", "sports">
lastUpdated: <YYYY-MM-DD>
---

## What happens in the classroom

<2-3 sentences of teaching notes describing the arc of the lesson — what the teacher introduces, what the students do, what the discussion looks like.>

## Learning goals in detail

<1-2 sentences expanding on each frontmatter learning goal.>

## Notes for instructors

<2-3 sentences with practical guidance — common student misconceptions, timing tips, what evidence of understanding looks like.>
```

Concrete example — `resources/histogram-characters.md`:

```markdown
---
title: Histogram exploration with the characters dataset
shortDescription: Students build histograms of character heights and reason about shape, center, and spread.
whatStudentsDo: Generate histograms with different bin widths and compare the resulting shapes.
type: JNB
jnbSubtype: Exploration
function: Teaching
modality: Online
coverage: Section
textbookVersions:
  - ABC v5.0
  - ABC v6.0
learningGoals:
  - Identify how bin width changes the apparent shape of a distribution
  - Distinguish unimodal from bimodal distributions
  - Use vocabulary of center and spread accurately
topicTags:
  - histograms
  - distributions
  - data visualization
lengthMinutes: 45
extraMaterialsNeeded: false
studentDataCollectionRequired: false
dataset:
  name: characters
  source: CourseKata starter datasets v2
  variableCount: 6
  variableTypes:
    - numeric
    - categorical
  topicTags:
    - fictional characters
    - heights
lastUpdated: 2026-04-15
---

## What happens in the classroom

The teacher opens with a quick recap of why we visualize distributions before computing statistics. Students then work through the notebook in pairs: first generating a default histogram, then varying the bin width and noticing how the shape changes. The lesson closes with a short discussion comparing student conclusions when bins are too narrow vs. too wide.

## Learning goals in detail

Students should leave able to articulate that bin width is a *choice*, not a property of the data. They should be able to describe the heights distribution using "unimodal", "roughly symmetric", and rough numerical center/spread.

## Notes for instructors

Common misconception: students treat the default histogram as "the answer". Push them to try at least three bin widths before drawing conclusions. Strong evidence of understanding looks like a student spontaneously asking "but what bin width are we using?" when comparing two histograms.
```

Create all 10 files. Use plausible CourseKata-flavored content — the goal is realistic-looking eval data, not perfect pedagogy. If you find yourself spending more than 5 minutes per file on the body, the body is too long; cut it down.

- [ ] **Step 5: Commit and push the content repo**

```bash
git add README.md resources/
git commit -m "Seed content repo with 10 sample resources"
git push origin main
```

If push fails because the remote doesn't have a `main` branch yet:

```bash
git push -u origin main
```

- [ ] **Step 6: Return to the app repo working directory**

```bash
cd /Users/martinstanojevic/projects/studio
```

(No commit needed in this repo for this task — content lives in the other repo.)

---

## Task 5: Verify content fetching works in dev

**Files:**
- None (verification only)

- [ ] **Step 1: Set up `.env` with a GitHub token**

Anonymous GitHub API requests are capped at 60/hr per IP, which is exhausted quickly during dev. Add a token:

```bash
cp .env.example .env
```

Edit `.env`. Set `GITHUB_TOKEN` to a GitHub Personal Access Token with read access to `martinstanojevic/studio-content` (fine-grained PAT or classic with `public_repo` scope).

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

Expected: server starts. On first dev run, `@nuxt/content` fetches files from the content repo and indexes them. Watch for log output mentioning "fetching from github.com/martinstanojevic/studio-content" or similar. There should be no "404", "rate limit", or "cannot resolve schema" errors.

- [ ] **Step 3: Spot-check that a single resource is queryable**

In a second terminal (leave dev server running):

```bash
curl -s "http://localhost:3000/api/_content/query?path=/resources/histogram-characters" | head -100
```

Or if that endpoint isn't exposed, add a temporary debug page:

Path: `app/pages/_debug-content.vue`

```vue
<template>
  <pre class="p-6 text-xs">{{ data }}</pre>
</template>

<script setup lang="ts">
const { data } = await useAsyncData('debug-resources', () =>
  queryCollection('resources').all(),
)
</script>
```

Visit http://localhost:3000/_debug-content. Expected: JSON output containing all 10 resources with full frontmatter. If you see fewer than 10, or if frontmatter values look wrong, fix the corresponding markdown files in the content repo, push, and restart `npm run dev`.

- [ ] **Step 4: Delete the debug page**

```bash
rm app/pages/_debug-content.vue
```

Stop the dev server.

- [ ] **Step 5: Commit any tweaks**

If `content.config.ts` or other files needed adjustments to make Step 3 work:

```bash
git add -A
git commit -m "Adjust content config to fetch successfully from studio-content"
```

If nothing changed, skip the commit.

---

## Task 6: Build the `ResourceCard` component

**Files:**
- Create: `app/components/ResourceCard.vue`

- [ ] **Step 1: Write the component**

Path: `app/components/ResourceCard.vue`

```vue
<template>
  <UCard
    :ui="{ body: 'p-4' }"
    class="hover:border-primary transition-colors h-full"
  >
    <NuxtLink :to="resource.path" class="block">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="font-semibold text-base leading-tight">{{ resource.title }}</h3>
        <UBadge :label="resource.type" variant="soft" size="sm" />
      </div>
      <p class="text-sm text-muted line-clamp-3 mb-3">{{ resource.shortDescription }}</p>
      <div class="flex items-center gap-3 text-xs text-muted">
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-clock" class="size-3.5" />
          {{ resource.lengthMinutes }} min
        </span>
        <span v-if="resource.dataset" class="flex items-center gap-1">
          <UIcon name="i-lucide-database" class="size-3.5" />
          {{ resource.dataset.name }}
        </span>
        <span class="ml-auto">{{ formatDate(resource.lastUpdated) }}</span>
      </div>
    </NuxtLink>
  </UCard>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'

defineProps<{ resource: Resource }>()

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>
```

- [ ] **Step 2: Drop a temporary index page to verify rendering**

Replace `app/pages/index.vue` (create if missing) with:

```vue
<template>
  <div class="max-w-7xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-6">Resources ({{ data?.length ?? 0 }})</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ResourceCard v-for="r in data" :key="r.path" :resource="r as any" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useAsyncData('resources', () =>
  queryCollection('resources').all(),
)
</script>
```

(`as any` is a temporary cast — Task 9 introduces a properly typed util. We're verifying the card renders right now.)

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```

Open http://localhost:3000. Expected: a 3-column grid of 10 resource cards, each showing title, type badge, short description (clamped at 3 lines), length, dataset name (where present), and a formatted last-updated date. Hovering a card highlights its border. Clicking navigates to a 404 — that's expected; we build the detail page in Task 12.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/components/ResourceCard.vue app/pages/index.vue
git commit -m "Add ResourceCard component and bare catalog grid"
```

---

## Task 7: Build the pure filter/sort/search utility

**Files:**
- Create: `app/utils/filterResources.ts`

- [ ] **Step 1: Define the filter shape and the function**

Path: `app/utils/filterResources.ts`

```ts
import type { Resource } from '~/types/resource'

export interface ResourceFilters {
  q: string
  types: string[]
  functions: string[]
  modalities: string[]
  coverages: string[]
  textbookVersions: string[]
  topicTags: string[]
  lengthMin: number | null
  lengthMax: number | null
  requiresExtraMaterials: boolean | null
  sort: 'lastUpdated' | 'title' | 'length'
}

export const EMPTY_FILTERS: ResourceFilters = {
  q: '',
  types: [],
  functions: [],
  modalities: [],
  coverages: [],
  textbookVersions: [],
  topicTags: [],
  lengthMin: null,
  lengthMax: null,
  requiresExtraMaterials: null,
  sort: 'lastUpdated',
}

export function applyFilters(resources: Resource[], f: ResourceFilters): Resource[] {
  const q = f.q.trim().toLowerCase()
  const filtered = resources.filter((r) => {
    if (f.types.length && !f.types.includes(r.type)) return false
    if (f.functions.length && !f.functions.includes(r.function)) return false
    if (f.modalities.length && !f.modalities.includes(r.modality)) return false
    if (f.coverages.length && !f.coverages.includes(r.coverage)) return false
    if (f.textbookVersions.length && !r.textbookVersions.some(v => f.textbookVersions.includes(v))) return false
    if (f.topicTags.length && !r.topicTags.some(t => f.topicTags.includes(t))) return false
    if (f.lengthMin != null && r.lengthMinutes < f.lengthMin) return false
    if (f.lengthMax != null && r.lengthMinutes > f.lengthMax) return false
    if (f.requiresExtraMaterials === true && !r.extraMaterialsNeeded) return false
    if (f.requiresExtraMaterials === false && r.extraMaterialsNeeded) return false
    if (q) {
      const haystack = `${r.title} ${r.shortDescription} ${r.topicTags.join(' ')}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  return [...filtered].sort((a, b) => {
    if (f.sort === 'title') return a.title.localeCompare(b.title)
    if (f.sort === 'length') return a.lengthMinutes - b.lengthMinutes
    // lastUpdated, descending
    return b.lastUpdated.localeCompare(a.lastUpdated)
  })
}

export function isFilterActive(f: ResourceFilters): boolean {
  return (
    f.q.length > 0 ||
    f.types.length > 0 ||
    f.functions.length > 0 ||
    f.modalities.length > 0 ||
    f.coverages.length > 0 ||
    f.textbookVersions.length > 0 ||
    f.topicTags.length > 0 ||
    f.lengthMin != null ||
    f.lengthMax != null ||
    f.requiresExtraMaterials != null
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/utils/filterResources.ts
git commit -m "Add pure filter/sort utility for resources"
```

(No verification step — this is a pure function used by Task 9. Errors will surface when wired up.)

---

## Task 8: Build the URL-driven filter state composable

**Files:**
- Create: `app/composables/useResourceFilters.ts`

- [ ] **Step 1: Write the composable**

Path: `app/composables/useResourceFilters.ts`

```ts
import { computed } from 'vue'
import { useRoute, useRouter } from '#imports'
import { EMPTY_FILTERS, type ResourceFilters } from '~/utils/filterResources'

const ARRAY_KEYS = ['types', 'functions', 'modalities', 'coverages', 'textbookVersions', 'topicTags'] as const

function readArray(value: unknown): string[] {
  if (typeof value === 'string') return value.split(',').filter(Boolean)
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  return []
}

function readNumber(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function readBoolean(value: unknown): boolean | null {
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

function readSort(value: unknown): ResourceFilters['sort'] {
  if (value === 'title' || value === 'length' || value === 'lastUpdated') return value
  return 'lastUpdated'
}

export function useResourceFilters() {
  const route = useRoute()
  const router = useRouter()

  const filters = computed<ResourceFilters>(() => ({
    q: typeof route.query.q === 'string' ? route.query.q : '',
    types: readArray(route.query.types),
    functions: readArray(route.query.functions),
    modalities: readArray(route.query.modalities),
    coverages: readArray(route.query.coverages),
    textbookVersions: readArray(route.query.textbookVersions),
    topicTags: readArray(route.query.topicTags),
    lengthMin: readNumber(route.query.lengthMin),
    lengthMax: readNumber(route.query.lengthMax),
    requiresExtraMaterials: readBoolean(route.query.requiresExtraMaterials),
    sort: readSort(route.query.sort),
  }))

  function update(patch: Partial<ResourceFilters>) {
    const next = { ...filters.value, ...patch }
    const query: Record<string, string> = {}
    if (next.q) query.q = next.q
    for (const key of ARRAY_KEYS) {
      if (next[key].length) query[key] = next[key].join(',')
    }
    if (next.lengthMin != null) query.lengthMin = String(next.lengthMin)
    if (next.lengthMax != null) query.lengthMax = String(next.lengthMax)
    if (next.requiresExtraMaterials != null) query.requiresExtraMaterials = String(next.requiresExtraMaterials)
    if (next.sort !== 'lastUpdated') query.sort = next.sort
    router.replace({ query })
  }

  function reset() {
    router.replace({ query: {} })
  }

  return { filters, update, reset, EMPTY_FILTERS }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/composables/useResourceFilters.ts
git commit -m "Add URL-driven resource filters composable"
```

---

## Task 9: Build the filter sidebar component

**Files:**
- Create: `app/components/ResourceFilters.vue`

- [ ] **Step 1: Write the component**

Path: `app/components/ResourceFilters.vue`

```vue
<template>
  <aside class="space-y-5 sticky top-6">
    <div class="flex items-center justify-between">
      <h2 class="font-semibold">Filters</h2>
      <UButton
        v-if="active"
        size="xs"
        variant="ghost"
        label="Reset"
        @click="reset"
      />
    </div>

    <UFormField label="Type">
      <USelectMenu
        :model-value="filters.types"
        :items="typeOptions"
        multiple
        searchable
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ types: v })"
      />
    </UFormField>

    <UFormField label="Function">
      <USelectMenu
        :model-value="filters.functions"
        :items="functionOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ functions: v })"
      />
    </UFormField>

    <UFormField label="Modality">
      <USelectMenu
        :model-value="filters.modalities"
        :items="modalityOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ modalities: v })"
      />
    </UFormField>

    <UFormField label="Coverage">
      <USelectMenu
        :model-value="filters.coverages"
        :items="coverageOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ coverages: v })"
      />
    </UFormField>

    <UFormField label="Textbook version">
      <USelectMenu
        :model-value="filters.textbookVersions"
        :items="textbookVersionOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ textbookVersions: v })"
      />
    </UFormField>

    <UFormField label="Topic tags">
      <USelectMenu
        :model-value="filters.topicTags"
        :items="topicTagOptions"
        multiple
        searchable
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ topicTags: v })"
      />
    </UFormField>

    <UFormField label="Length (minutes)">
      <div class="flex items-center gap-2">
        <UInput
          type="number"
          :model-value="filters.lengthMin ?? undefined"
          placeholder="Min"
          class="flex-1"
          @update:model-value="(v: any) => update({ lengthMin: v === '' || v == null ? null : Number(v) })"
        />
        <span class="text-muted">–</span>
        <UInput
          type="number"
          :model-value="filters.lengthMax ?? undefined"
          placeholder="Max"
          class="flex-1"
          @update:model-value="(v: any) => update({ lengthMax: v === '' || v == null ? null : Number(v) })"
        />
      </div>
    </UFormField>

    <UFormField label="Extra materials needed">
      <USelectMenu
        :model-value="extraMaterialsValue"
        :items="extraMaterialsOptions"
        placeholder="Any"
        @update:model-value="onExtraMaterialsChange"
      />
    </UFormField>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import { isFilterActive } from '~/utils/filterResources'

const props = defineProps<{ resources: Resource[] }>()

const { filters, update, reset } = useResourceFilters()

function uniq<T>(arr: T[]): T[] { return [...new Set(arr)] }

const typeOptions = computed(() => uniq(props.resources.map(r => r.type)).sort())
const functionOptions = computed(() => uniq(props.resources.map(r => r.function)).sort())
const modalityOptions = computed(() => uniq(props.resources.map(r => r.modality)).sort())
const coverageOptions = computed(() => uniq(props.resources.map(r => r.coverage)).sort())
const textbookVersionOptions = computed(() => uniq(props.resources.flatMap(r => r.textbookVersions)).sort())
const topicTagOptions = computed(() => uniq(props.resources.flatMap(r => r.topicTags)).sort())

const active = computed(() => isFilterActive(filters.value))

const extraMaterialsOptions = ['Any', 'Required', 'Not required']
const extraMaterialsValue = computed(() => {
  if (filters.value.requiresExtraMaterials === true) return 'Required'
  if (filters.value.requiresExtraMaterials === false) return 'Not required'
  return 'Any'
})
function onExtraMaterialsChange(v: string) {
  update({
    requiresExtraMaterials: v === 'Required' ? true : v === 'Not required' ? false : null,
  })
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/ResourceFilters.vue
git commit -m "Add ResourceFilters faceted sidebar"
```

---

## Task 10: Build the sort dropdown component

**Files:**
- Create: `app/components/ResourceSort.vue`

- [ ] **Step 1: Write the component**

Path: `app/components/ResourceSort.vue`

```vue
<template>
  <USelectMenu
    :model-value="current"
    :items="options"
    value-key="value"
    label-key="label"
    @update:model-value="(v: any) => update({ sort: v })"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResourceFilters } from '~/utils/filterResources'

const { filters, update } = useResourceFilters()

const options: { label: string, value: ResourceFilters['sort'] }[] = [
  { label: 'Last updated', value: 'lastUpdated' },
  { label: 'Title (A–Z)', value: 'title' },
  { label: 'Length (short → long)', value: 'length' },
]

const current = computed(() => filters.value.sort)
</script>
```

- [ ] **Step 2: Commit**

```bash
git add app/components/ResourceSort.vue
git commit -m "Add ResourceSort dropdown"
```

---

## Task 11: Wire the catalog page together

**Files:**
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Replace `app/pages/index.vue`**

```vue
<template>
  <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
    <ResourceFilters :resources="(data ?? []) as any" />

    <div>
      <div class="flex items-center justify-between mb-6 gap-3">
        <UInput
          :model-value="filters.q"
          icon="i-lucide-search"
          placeholder="Search resources"
          class="flex-1 max-w-md"
          @update:model-value="(v: string) => update({ q: v })"
        />
        <ResourceSort />
      </div>

      <p class="text-sm text-muted mb-4">{{ visible.length }} of {{ data?.length ?? 0 }} resources</p>

      <div v-if="visible.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ResourceCard v-for="r in visible" :key="r.path" :resource="r" />
      </div>
      <div v-else class="text-center py-16 text-muted">
        <UIcon name="i-lucide-search-x" class="size-10 mx-auto mb-3" />
        <p>No resources match the current filters.</p>
        <UButton class="mt-4" variant="ghost" label="Reset filters" @click="reset" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import { applyFilters } from '~/utils/filterResources'

const { data } = await useAsyncData('resources', () =>
  queryCollection('resources').all(),
)

const { filters, update, reset } = useResourceFilters()

const visible = computed<Resource[]>(() => applyFilters((data.value ?? []) as Resource[], filters.value))
</script>
```

- [ ] **Step 2: Verify in the browser**

```bash
npm run dev
```

Open http://localhost:3000. Verify each behavior:

1. All 10 cards render initially.
2. Typing in the search box filters cards live and updates `?q=...` in the URL.
3. Selecting a Type filter updates `?types=...` and the visible set shrinks.
4. The "X of 10 resources" counter updates correctly.
5. Sorting by Title reorders cards alphabetically.
6. Refreshing the page with filters in the URL preserves the filtered view.
7. Setting filters that match nothing shows the "No resources match" empty state.
8. The "Reset" button clears the URL and shows all 10 cards.

If any of these fail, fix the relevant component before committing. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git commit -m "Wire filters, sort, and search into catalog page"
```

---

## Task 12: Build the resource detail page

**Files:**
- Create: `app/pages/resources/[slug].vue`

- [ ] **Step 1: Write the page**

Path: `app/pages/resources/[slug].vue`

```vue
<template>
  <div v-if="resource" class="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-8">
    <div>
      <UButton
        :to="backHref"
        variant="ghost"
        size="sm"
        icon="i-lucide-arrow-left"
        label="Back to catalog"
        class="mb-4"
      />

      <h1 class="text-3xl font-semibold mb-2">{{ resource.title }}</h1>
      <div class="flex items-center gap-3 text-sm text-muted mb-6">
        <UBadge :label="resource.type" variant="soft" />
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-clock" class="size-4" />
          {{ resource.lengthMinutes }} min
        </span>
        <span>Updated {{ formatDate(resource.lastUpdated) }}</span>
      </div>

      <p class="text-lg text-muted mb-8">{{ resource.shortDescription }}</p>

      <ContentRenderer v-if="resource" :value="resource" class="prose dark:prose-invert max-w-none" />
    </div>

    <aside class="space-y-5 lg:sticky lg:top-6 lg:self-start">
      <UCard>
        <dl class="space-y-3 text-sm">
          <DetailRow label="Function" :value="resource.function" />
          <DetailRow label="Modality" :value="resource.modality" />
          <DetailRow label="Coverage" :value="resource.coverage" />
          <DetailRow label="Textbook versions" :value="resource.textbookVersions.join(', ')" />
          <DetailRow
            label="Student data collection"
            :value="resource.studentDataCollectionRequired ? 'Required' : 'Not required'"
          />
          <DetailRow
            v-if="resource.extraMaterialsNeeded"
            label="Extra materials"
            :value="(resource.extraMaterialsList ?? []).join(', ') || 'Required (see notes)'"
          />
        </dl>
      </UCard>

      <UCard v-if="resource.learningGoals.length">
        <h3 class="font-semibold text-sm mb-3">Learning goals</h3>
        <ul class="space-y-2 text-sm list-disc list-inside text-muted">
          <li v-for="g in resource.learningGoals" :key="g">{{ g }}</li>
        </ul>
      </UCard>

      <UCard v-if="resource.dataset">
        <h3 class="font-semibold text-sm mb-3">Dataset</h3>
        <dl class="space-y-2 text-sm">
          <DetailRow label="Name" :value="resource.dataset.name" />
          <DetailRow label="Source" :value="resource.dataset.source" />
          <DetailRow label="Variables" :value="`${resource.dataset.variableCount} (${resource.dataset.variableTypes.join(', ')})`" />
          <DetailRow v-if="resource.dataset.topicTags.length" label="Tags" :value="resource.dataset.topicTags.join(', ')" />
        </dl>
      </UCard>
    </aside>
  </div>
  <div v-else class="max-w-3xl mx-auto p-6 text-center text-muted">
    Resource not found.
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '~/types/resource'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: resource } = await useAsyncData(`resource-${slug.value}`, () =>
  queryCollection('resources').path(`/resources/${slug.value}`).first(),
) as { data: Ref<Resource | null> }

const backHref = computed(() => {
  const fromQuery = typeof route.query.from === 'string' ? route.query.from : ''
  return fromQuery || '/'
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>
```

- [ ] **Step 2: Add the small `DetailRow` helper component**

Path: `app/components/DetailRow.vue`

```vue
<template>
  <div class="flex justify-between gap-4">
    <dt class="text-muted">{{ label }}</dt>
    <dd class="text-right">{{ value }}</dd>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string }>()
</script>
```

- [ ] **Step 3: Verify in the browser**

```bash
npm run dev
```

Open http://localhost:3000, click "Histogram exploration with the characters dataset". Verify:

1. The page renders without errors.
2. Title, type badge, length, and last-updated render in the header.
3. The markdown body renders as headings + paragraphs (the "What happens in the classroom" / "Learning goals in detail" / "Notes for instructors" sections from Task 4's body template).
4. The right-side panel shows function, modality, coverage, textbook versions, student-data-collection flag.
5. The Learning goals card lists the 3 goals.
6. The Dataset card shows name, source, variable count, variable types, tags.
7. Clicking "Back to catalog" returns to `/`.

Visit a resource that has `extraMaterialsNeeded: true` (e.g. linear-models-worksheet) and confirm the Extra materials row appears.

Visit a resource without a dataset (e.g. intro-statistics-deck) and confirm the Dataset card is hidden.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/pages/resources/[slug].vue app/components/DetailRow.vue
git commit -m "Add resource detail page with metadata sidebar"
```

---

## Task 13: Configure `app.config.ts` for site-level Studio-editable settings

**Files:**
- Create: `app.config.ts`

- [ ] **Step 1: Write `app.config.ts`**

Path: `app.config.ts` (project root)

```ts
export default defineAppConfig({
  site: {
    title: 'CourseKata Resources',
    tagline: 'Find teaching materials for the CourseKata curriculum.',
    footer: '© CourseKata. Edited via Nuxt Studio.',
  },
})
```

- [ ] **Step 2: Surface the tagline on the catalog page**

Modify `app/pages/index.vue` — replace the line containing `<div class="max-w-7xl mx-auto p-6 grid` and add a header block above the grid:

```vue
<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-semibold">{{ appConfig.site.title }}</h1>
      <p class="text-muted">{{ appConfig.site.tagline }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
      <ResourceFilters :resources="(data ?? []) as any" />

      <div>
        <!-- existing search/sort/grid block unchanged -->
        <!-- ... -->
      </div>
    </div>
  </div>
</template>
```

Add `const appConfig = useAppConfig()` at the top of the existing `<script setup>`.

- [ ] **Step 3: Verify**

```bash
npm run dev
```

The catalog page should now show "CourseKata Resources" and the tagline above the filters/grid. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add app.config.ts app/pages/index.vue
git commit -m "Add site-level config with title and tagline"
```

---

## Task 14: Write the README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

Path: `README.md` (project root)

```markdown
# CourseKata Studio Eval App

Internal evaluation prototype for the [CourseKata Teaching Resources spec (2026)](./CourseKata%20Teaching%20Resources%20Website%20Functional%20Spec%202026.md), built to test whether [Nuxt Studio](https://studio.nuxt.com) can deliver the content management workflow CourseKata needs.

See [`docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md`](./docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md) for full design context.

## Architecture

- **App repo** (this repo) — Nuxt 4 app with schema, pages, components.
- **Content repo** — [`martinstanojevic/studio-content`](https://github.com/martinstanojevic/studio-content) — markdown source files.
- `@nuxt/content` v3 pulls content from the content repo via its GitHub source. Studio is connected to the **content** repo.

## Local development

1. Copy `.env.example` to `.env` and add a GitHub Personal Access Token (recommended for higher rate limits, even on public repos).
2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:3000.

The app fetches markdown from `martinstanojevic/studio-content` on first dev run. To pick up changes pushed to that repo, restart `npm run dev` (or wait for `@nuxt/content`'s revalidation).

## Connecting Nuxt Studio

1. Sign in to https://studio.nuxt.com with the GitHub account that owns `martinstanojevic/studio-content`.
2. Create a new project pointing at **`martinstanojevic/studio-content`** (the content repo, not this repo).
3. Grant repo access. Studio will read the schema (see Risks in the design doc for how this works in a split-repo setup) and generate editor forms.
4. Edits made in Studio land as commits to `martinstanojevic/studio-content`.

## Evaluation criteria

See the [design doc](./docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md#evaluation-criteria) — these become the deliverable from this prototype.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add project README with dev and Studio-connection instructions"
```

---

## Task 15: Push the app repo to GitHub

**Files:**
- None (remote setup only)

- [ ] **Step 1: Confirm or create the app repo on GitHub**

Ask the user: "What name should the app repo have on GitHub? Suggested: `coursekata-studio-eval`. Public or private?"

Once decided, run (replacing `<repo-name>` and `--public`/`--private` per the user's answer):

```bash
gh repo create martinstanojevic/<repo-name> --<visibility> --source=. --remote=origin --push
```

If `gh` is not authenticated, run `gh auth login` first.

If the user prefers manual setup, they can create the repo via the GitHub UI; then run:

```bash
git remote add origin https://github.com/martinstanojevic/<repo-name>.git
git push -u origin main
```

- [ ] **Step 2: Verify push**

```bash
git remote -v
git log origin/main --oneline | head -5
```

Expected: `origin` points at the new repo, and the recent commits are listed under `origin/main`.

- [ ] **Step 3: No commit needed**

This task only sets up the remote; nothing to commit locally.

---

## Task 16: Connect Nuxt Studio (manual user step)

**Files:**
- None (external service)

This task is performed by the user in a browser, not the executor.

- [ ] **Step 1: Ask the user to perform the connection**

Output to the user:

> Manual step required:
>
> 1. Open https://studio.nuxt.com and sign in with the GitHub account `martinstanojevic`.
> 2. Click "New project" (or equivalent) and select the **`martinstanojevic/studio-content`** repo.
> 3. Grant access when prompted.
> 4. If Studio asks for a "linked app repo" or "schema source", point it at the app repo created in Task 15.
> 5. Wait for Studio to finish indexing (usually under a minute).
> 6. Reply with: (a) screenshots or notes on the editor form Studio generated, and (b) any errors or warnings encountered during connection.

- [ ] **Step 2: Record what happened**

When the user replies, append the findings to `docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md` under a new `## Connection Notes` section. Specifically capture:

- Was the schema discovered automatically, or did it require mirroring `nuxt.schema.ts` into the content repo?
- Did all 10 sample resources appear in Studio's file list?
- Did the form render every field type cleanly, or did some (nested `dataset`, optional `jnbSubtype`, arrays) require workarounds?

Then commit:

```bash
git add docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md
git commit -m "Record Studio connection findings"
```

---

## Task 17: Run the manual evaluation pass

**Files:**
- Modify: `docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md` (append findings)

This task is performed by the user with assistance from the executor — the executor's role is to ask the right questions and record answers.

- [ ] **Step 1: Walk through each evaluation criterion**

For each of the five criteria from the design doc's "Evaluation Criteria" section, ask the user:

1. **Schema rendering** — "Open the histogram-characters resource in Studio. Does the editor cleanly render every field (the type enum, the optional jnbSubtype, the textbookVersions/learningGoals/topicTags arrays, the lengthMinutes number, the booleans, the nested dataset object, the lastUpdated date)? Anything render incorrectly or as raw JSON?"
2. **Live preview** — "Edit the title in Studio. How fast does the preview update? Does it stay accurate? Try editing the markdown body too."
3. **Media library** — "Add an image to one resource's body via Studio's media library. Does it upload, render in preview, and commit to the right path?"
4. **Editor UX for non-engineers** — "Imagine you're a CourseKata content editor with no Git experience. Walk through making and saving an edit. What's confusing? What's the commit/branch story?"
5. **Schema fidelity** — "Are there any schema constructs (conditional fields, nested objects, enums, dates) that Studio degrades, drops, or renders awkwardly?"

- [ ] **Step 2: Record findings in the design doc**

Append a `## Evaluation Findings` section to `docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md` with one subsection per criterion, capturing:

- What worked
- What didn't
- Whether this is a blocker, a workaround-able issue, or a non-issue
- For each issue, a one-sentence recommendation (e.g. "Mirror schema as `nuxt.schema.ts` in content repo until Studio supports cross-repo schema discovery")

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md
git commit -m "Record manual Studio evaluation findings"
```

- [ ] **Step 4: Push**

```bash
git push
```

The evaluation report is now part of the repo's history.

---

## Self-Review (run after writing the plan; results recorded inline below)

**Spec coverage:** Each section of the design doc has at least one task implementing it.

| Spec section | Implementing task(s) |
|---|---|
| In-scope: instructor catalog | Tasks 6, 7, 8, 9, 10, 11 |
| In-scope: resource detail page | Task 12 |
| In-scope: rich resources schema | Task 3 |
| In-scope: ~10 sample resources | Task 4 |
| In-scope: Studio integration | Tasks 4, 15, 16 |
| Architecture: two-repo split | Tasks 3 (source config), 4 (content repo), 15 (app repo) |
| Pages and UX: catalog | Task 11 |
| Pages and UX: detail | Task 12 |
| Filter state mechanics: URL-driven | Task 8 (composable), Task 11 (wiring) |
| Sample data distribution | Task 4 (frontmatter table) |
| Evaluation criteria | Task 17 |
| Risks: package name verification | Task 1 |
| Risks: cross-repo schema discovery | Task 16, Step 2 |
| Risks: GitHub source dev loop | Task 5 |

**Placeholder scan:** No "TBD", "implement later", or "similar to" without code. The frontmatter table in Task 4 is explicit per file, with a worked example. The verification fields in Task 1, Step 5 are flagged as "fill from Step N" which is a deliberate, addressable gap, not a placeholder.

**Type consistency:** `Resource` type defined in Task 3 is used unchanged in Tasks 6, 7, 9, 10, 11, 12. `ResourceFilters` defined in Task 7 is used unchanged in Tasks 8, 9, 10, 11. `applyFilters`/`isFilterActive`/`EMPTY_FILTERS` exported in Task 7 are referenced by their exact names in Tasks 8, 9, 11. `useResourceFilters` exported in Task 8 is consumed by name in Tasks 9, 10, 11. No drift.

---

## Risks left to the executor

- The exact `source` config keys for `@nuxt/content` v3's GitHub source may differ from what's written in Task 3. Task 1 verifies; Task 3 is editable.
- Studio's exact connection flow may have changed since this plan was written. Task 16 is intentionally conversational rather than scripted.
- If the executor finds Studio cannot read schema from a separate app repo, mirroring the schema (or a generated subset) into the content repo is the most likely workaround — but that's a finding worth documenting before applying a fix.
