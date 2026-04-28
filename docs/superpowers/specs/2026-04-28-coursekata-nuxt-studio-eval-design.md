# CourseKata × Nuxt Studio Fit Evaluation — Design

**Date:** 2026-04-28
**Status:** Approved (awaiting user review of written spec)
**Source spec:** [`CourseKata Teaching Resources Website Functional Spec 2026.md`](../../../CourseKata%20Teaching%20Resources%20Website%20Functional%20Spec%202026.md)

## Purpose

Build a small, focused Nuxt application that exercises the Nuxt Studio + Nuxt Content workflow against a realistic slice of the CourseKata Teaching Resources spec, in order to evaluate whether Studio is a viable CMS choice for the eventual production build.

This is an **internal evaluation prototype**, not a shippable product or stakeholder pitch. Polish is secondary to schema fidelity, content-management workflow, and surfacing any places Studio cannot deliver what the spec needs.

## Scope

### In scope

- Instructor-facing **catalog page** (`/`) — browse, filter, sort, search across resources
- Resource **detail / preview page** (`/resources/[slug]`) — full metadata + rendered markdown body
- Rich `resources` content collection with the full structured schema derived from the spec
- ~10 sample resources covering enough enum diversity to make filtering meaningful
- Full Nuxt Studio integration: GitHub-backed repo connected at `studio.nuxt.com`, edits flowing as commits

### Out of scope (explicit)

- App-level user authentication (no logged-in vs logged-out experiences). Only Studio's own GitHub-based auth is in scope.
- AI-assisted search
- Bulk download / zip generation
- Discussion forums / Discourse integration
- Trust signals, adoption indicators, testimonials
- Distinct researcher and site-admin UIs (admin == Studio itself)
- Production hosting / deploy target
- Automated tests (eval prototype, not shipping product)
- Blog / pedagogy content collection (deferred — could be a follow-up if the eval is positive)
- Public/logged-out marketing landing page (deferred for the same reason)

## Architecture

```
Nuxt 4  +  @nuxt/content v3  +  Nuxt UI v3  +  TypeScript

content/
  resources/
    *.md                       # one resource per file (frontmatter + body)

content.config.ts              # Zod schema for the `resources` collection
nuxt.config.ts                 # registers Studio module

app/
  pages/
    index.vue                  # catalog (browse + filter + sort + search)
    resources/[slug].vue       # resource detail / preview
  components/
    ResourceCard.vue
    ResourceFilters.vue
    ResourceSort.vue
  app.config.ts                # site-level editable settings (title, hero copy, footer)

public/
```

### Stack rationale

- **Nuxt 4 + @nuxt/content v3** — required for current Studio compatibility.
- **Nuxt UI v3 (free tier)** — de-facto Nuxt component library; gives polished filter sidebar (`USelectMenu`, `UCheckbox`), card grid (`UCard`), search (`UInput`), and detail layout with low effort. Lets the eval focus on content management rather than primitive UI.
- **TypeScript** — schema is the centerpiece of the eval; strong typing on both frontmatter and component props keeps surprises out.

### Studio module registration

`nuxt.config.ts` registers the Studio module (current package name to be verified at implementation time — Nuxt renamed several modules in the v3→v4 transition; the implementation plan will pin the correct one).

## Content Schema

Defined in `content.config.ts`. This schema is what Studio reads to generate editor forms — schema fidelity is the eval's primary signal.

```ts
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    resources: defineCollection({
      type: 'page',
      source: 'resources/*.md',
      schema: z.object({
        title: z.string(),
        shortDescription: z.string(),
        whatStudentsDo: z.string(),

        type: z.enum(['JNB', 'Worksheet', 'Slide deck', 'Activity', 'Assessment', 'Reading']),
        jnbSubtype: z.string().optional(),                    // only when type === 'JNB'
        function: z.enum(['Teaching', 'Assessment', 'Practice', 'Discussion', 'Project']),
        modality: z.enum(['Online', 'Paper-based', 'Hybrid']),
        coverage: z.enum(['Page', 'Section', 'Chapter', 'Book', 'Concept']),

        textbookVersions: z.array(z.string()),
        learningGoals: z.array(z.string()),
        topicTags: z.array(z.string()),                       // pedagogy tags for the resource (e.g. "histograms", "ANOVA")

        lengthMinutes: z.number(),
        extraMaterialsNeeded: z.boolean(),
        extraMaterialsList: z.array(z.string()).optional(),
        studentDataCollectionRequired: z.boolean(),

        dataset: z.object({
          name: z.string(),
          source: z.string(),                                 // citation, URL, or "synthetic — see notes"
          variableCount: z.number(),
          variableTypes: z.array(z.enum(['numeric', 'categorical', 'ordinal', 'datetime', 'text'])),
          topicTags: z.array(z.string()),                     // domain tags for the dataset (e.g. "demographics", "sports")
        }).optional(),

        lastUpdated: z.date(),
      }),
    }),
  },
})
```

Markdown body holds the longer teaching notes / preview / "what happens in the classroom" — this gives Studio's MDC editor real content to manage, not just a metadata form.

### Mapping to source spec fields

| Spec field                              | Schema field                            |
|-----------------------------------------|-----------------------------------------|
| Short description                       | `shortDescription`                      |
| What students actually do               | `whatStudentsDo`                        |
| Learning goal(s) supported              | `learningGoals[]`                       |
| Length of time required                 | `lengthMinutes`                         |
| Extra materials needed (Yes/No)         | `extraMaterialsNeeded` + `extraMaterialsList[]` |
| Dataset(s) used                         | `dataset.name`                          |
| Number of variables / type of variables | `dataset.variableCount` / `dataset.variableTypes[]` |
| Topic tags (data)                       | `dataset.topicTags[]`                   |
| Student data collection required        | `studentDataCollectionRequired`         |
| Type (incl. JNB subtypes)               | `type` + `jnbSubtype`                   |
| Function                                | `function`                              |
| Modality                                | `modality`                              |
| Coverage                                | `coverage`                              |
| Textbook version (+ identify diffs)     | `textbookVersions[]`                    |
| Last updated                            | `lastUpdated`                           |
| Additional tags (extensible)            | `topicTags[]`                           |

## Pages and UX

### `/` — Catalog

**Top bar**
- Search input (`UInput`) — substring match across `title`, `shortDescription`, `topicTags`
- Sort dropdown (`USelectMenu`) — Last updated (default), Title (A–Z), Length (short → long)

**Left sidebar — faceted filters**
- Type (multi-select)
- Function (multi-select)
- Modality (multi-select)
- Coverage (multi-select)
- Textbook version (multi-select)
- Length (range slider, minutes)
- Extra materials needed (toggle)
- Topic tags (multi-select with type-ahead)
- "Reset filters" button when any filter is active

**Main**
- Card grid (`UCard`) — title, short description, type badge, length, dataset name (if any), "last updated"
- Empty state when filters match nothing

### `/resources/[slug]` — Detail

- Header: title, type badge, length, last-updated
- Sticky metadata panel: function, modality, coverage, textbook versions, learning goals, dataset block (name / source / variable count / variable types / dataset tags), extra materials list, student-data-collection flag
- Main column: rendered markdown body via `<ContentRenderer>`
- Back-to-catalog link preserves filter state from the URL the user arrived from

### Filter state mechanics

- All filter, sort, and search state lives in URL query params (e.g. `?type=JNB&function=Teaching&q=histogram&sort=length`)
- Initial page render is SSR with filters applied server-side via `queryCollection('resources').where(...)`
- Subsequent filter changes are client-side for instant feedback, with `navigateTo({ replace: true })` to keep the URL in sync
- Rationale: Studio's live preview re-renders the page on every keystroke. URL-driven state keeps previews stable, shareable, and refresh-safe.

## Sample Data

~10 resources written as `content/resources/*.md` files. Distribution chosen so every filter facet has at least two values to filter between:

- Mix of `type`: at least 3 JNBs, 2 worksheets, 1 slide deck, 1 activity, 1 assessment, 1 reading
- Mix of `function`, `modality`, `coverage`, `textbookVersions`
- Mix of `extraMaterialsNeeded` true/false
- Mix of `studentDataCollectionRequired` true/false
- Mix of resources with and without `dataset`
- Variety of `lengthMinutes` (10 → 90) so the range slider has work to do

Sample bodies are short but realistic (a paragraph or two of teaching notes plus a "what students will see" section), enough to give the markdown editor and renderer something real.

## Studio Integration Workflow

1. Scaffold the app locally; iterate until catalog + detail pages render correctly with sample content.
2. Initialize a Git repo and push to a fresh GitHub repo on the user's account (public or private — user chooses at push time).
3. User signs in to `studio.nuxt.com` with that GitHub account, creates a new project pointing at the repo, grants repo access.
4. Studio reads `content.config.ts`, builds editor forms, spins up preview.
5. Manual eval pass against the criteria below.

The user performs steps 3 and 5 manually; everything else is in the implementation plan.

## Evaluation Criteria

After integration, evaluate:

1. **Schema rendering** — does Studio's form editor cleanly render the full schema (enums, nested `dataset` object, optional `jnbSubtype`, string arrays, dates, booleans)?
2. **Live preview** — does preview update reliably as content is edited? Latency? Failure modes?
3. **Media library** — how does Studio handle images embedded in markdown bodies?
4. **Editor UX for non-engineers** — what's the commit/branch workflow like for someone who doesn't know Git?
5. **Schema fidelity** — are there any schema constructs Studio silently degrades, drops, or renders awkwardly?

These criteria become the eval report deliverable; they are not implementation tasks.

## Risks and Open Questions

- **Studio module package name:** Nuxt renamed several modules during the v3→v4 transition. The implementation plan will verify the current package name and pin it before installation, rather than guessing.
- **Nested object editing:** the `dataset` field is the most complex part of the schema; if Studio cannot edit nested objects gracefully, the eval surfaces that as a finding (not a blocker for the eval itself).
- **Conditional fields:** `jnbSubtype` is only meaningful when `type === 'JNB'`. Studio likely won't enforce conditional visibility from a Zod schema; this is expected and noted as part of the eval.
- **No tests:** intentional. Adding tests to a throwaway eval prototype is yak-shaving. Re-evaluate if any of this code is reused in the production build.
