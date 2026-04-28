import type { Resource } from '~/types/resource'

export interface ResourceFilters {
  q: string
  types: string[]
  functions: string[]
  modalities: string[]
  sort: 'lastUpdated' | 'title'
}

export const EMPTY_FILTERS: ResourceFilters = {
  q: '',
  types: [],
  functions: [],
  modalities: [],
  sort: 'lastUpdated',
}

export function applyFilters(resources: Resource[], f: ResourceFilters): Resource[] {
  const q = f.q.trim().toLowerCase()
  const filtered = resources.filter((r) => {
    if (f.types.length && !f.types.includes(r.type)) return false
    if (f.functions.length && !f.functions.includes(r.function)) return false
    if (f.modalities.length && !f.modalities.includes(r.modality)) return false
    if (q) {
      const haystack = `${r.title} ${r.description}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  return [...filtered].sort((a, b) => {
    if (f.sort === 'title') return a.title.localeCompare(b.title)
    // lastUpdated, descending. Falls back to title when the date field is
    // missing (e.g. stat() failed) so ordering stays stable.
    const am = a.lastModified ?? ''
    const bm = b.lastModified ?? ''
    if (am === bm) return a.title.localeCompare(b.title)
    return bm.localeCompare(am)
  })
}

export function isFilterActive(f: ResourceFilters): boolean {
  return (
    f.q.length > 0 ||
    f.types.length > 0 ||
    f.functions.length > 0 ||
    f.modalities.length > 0
  )
}
