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
