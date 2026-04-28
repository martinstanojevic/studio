import type { z } from '@nuxt/content'

// Re-derive from the schema for components to consume.
// We reconstruct the type here rather than importing from content.config.ts
// because the latter is a build config and importing it into runtime code
// pulls config-only modules into the client bundle.
//
// TODO (drift risk): this interface and the Zod schema in content.config.ts
// must be kept in sync by hand. If we add fields to one and forget the other,
// either runtime parsing rejects valid data or components see undeclared
// fields. The cleaner pattern is to factor the Zod schema into a shared
// module, then `export type ResourceFrontmatter = z.infer<typeof schema>`.
// Acceptable for the eval prototype; revisit if any of this code ships.
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
