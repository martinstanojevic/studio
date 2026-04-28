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
    hasExtras: readBoolean(route.query.hasExtras),
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
    if (next.hasExtras != null) query.hasExtras = String(next.hasExtras)
    if (next.sort !== 'lastUpdated') query.sort = next.sort
    router.replace({ query })
  }

  function reset() {
    router.replace({ query: {} })
  }

  return { filters, update, reset, EMPTY_FILTERS }
}
