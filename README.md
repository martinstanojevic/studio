# CourseKata Studio Eval App

Internal evaluation prototype for the [CourseKata Teaching Resources spec (2026)](./CourseKata%20Teaching%20Resources%20Website%20Functional%20Spec%202026.md), built to test whether [Nuxt Studio](https://studio.nuxt.com) can deliver the content management workflow CourseKata needs.

See [`docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md`](./docs/superpowers/specs/2026-04-28-coursekata-nuxt-studio-eval-design.md) for full design context.

## Architecture

- **App repo** (this repo) — Nuxt 4 app with schema, pages, components.
- **Content repo** — [`martinstanojevic/studio-content`](https://github.com/martinstanojevic/studio-content) — markdown source files.
- `@nuxt/content` v3 pulls content from the content repo via its GitHub source. Studio is connected to the **content** repo.

## Local development

1. Copy `.env.example` to `.env` and add a `GITHUB_TOKEN` (any GitHub PAT — no scopes required for public-repo access; the token raises the rate limit from 60/hr to 5000/hr).
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
