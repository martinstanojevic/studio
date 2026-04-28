import { computed } from 'vue'
import { useRoute, useRouter } from '#imports'
import { EMPTY_FILTERS, type ResourceFilters } from '~/utils/filterResources'

const ARRAY_KEYS = ['types', 'functions', 'modalities'] as const

function readArray(value: unknown): string[] {
  if (typeof value === 'string') return value.split(',').filter(Boolean)
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  return []
}

function readSort(value: unknown): ResourceFilters['sort'] {
  if (value === 'title' || value === 'lastUpdated') return value
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
    sort: readSort(route.query.sort),
  }))

  function update(patch: Partial<ResourceFilters>) {
    const next = { ...filters.value, ...patch }
    const query: Record<string, string> = {}
    if (next.q) query.q = next.q
    for (const key of ARRAY_KEYS) {
      if (next[key].length) query[key] = next[key].join(',')
    }
    if (next.sort !== 'lastUpdated') query.sort = next.sort
    router.replace({ query })
  }

  function reset() {
    router.replace({ query: {} })
  }

  return { filters, update, reset, EMPTY_FILTERS }
}
