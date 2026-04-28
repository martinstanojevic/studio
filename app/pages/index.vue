<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-semibold">{{ appConfig.site.title }}</h1>
      <p class="text-muted">{{ appConfig.site.tagline }}</p>
    </div>

    <div v-if="currentFolder" class="mb-4">
      <UButton
        :to="parentLink"
        variant="ghost"
        size="sm"
        icon="i-lucide-arrow-left"
        :label="parentLabel"
      />
      <h2 class="text-xl font-semibold mt-2">{{ folderName }}</h2>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8">
      <ResourceFilters :resources="folderResources as any" />

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

        <div v-if="subfolders.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          <FolderCard
            v-for="sf in subfolders"
            :key="sf.folder"
            :name="sf.name"
            :folder="sf.folder"
            :count="sf.count"
          />
        </div>

        <p class="text-sm text-muted mb-4">{{ visible.length }} resource{{ visible.length === 1 ? '' : 's' }}</p>

        <div v-if="visible.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <ResourceCard v-for="r in visible" :key="r.path" :resource="r" />
        </div>
        <div v-else-if="!subfolders.length" class="text-center py-16 text-muted">
          <UIcon name="i-lucide-search-x" class="size-10 mx-auto mb-3" />
          <p>No resources match the current filters.</p>
          <UButton class="mt-4" variant="ghost" label="Reset filters" @click="reset" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import { applyFilters } from '~/utils/filterResources'

const appConfig = useAppConfig()
const route = useRoute()

const { data } = await useAsyncData('resources', () =>
  queryCollection('resources').all(),
)

const allResources = computed(() => (data.value ?? []) as Resource[])

const currentFolder = computed(() => {
  const f = route.query.folder
  return typeof f === 'string' ? f : ''
})

const folderName = computed(() => {
  const parts = currentFolder.value.split('/')
  return parts[parts.length - 1] || ''
})

const parentLink = computed(() => {
  const parts = currentFolder.value.split('/')
  parts.pop()
  const parent = parts.join('/')
  return parent ? { path: '/', query: { folder: parent } } : '/'
})

const parentLabel = computed(() => {
  const parts = currentFolder.value.split('/')
  return parts.length > 1 ? `Back to ${parts[parts.length - 2]}` : 'Back to root'
})

const folderResources = computed(() => {
  const prefix = currentFolder.value ? `/resources/${currentFolder.value}/` : '/resources/'
  return allResources.value.filter((r) => {
    if (!r.path.startsWith(prefix)) return false
    const rest = r.path.slice(prefix.length)
    return !rest.includes('/')
  })
})

const subfolders = computed(() => {
  const prefix = currentFolder.value ? `/resources/${currentFolder.value}/` : '/resources/'
  const counts = new Map<string, number>()
  for (const r of allResources.value) {
    if (!r.path.startsWith(prefix)) continue
    const rest = r.path.slice(prefix.length)
    const slashIdx = rest.indexOf('/')
    if (slashIdx !== -1) {
      const name = rest.slice(0, slashIdx)
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      folder: currentFolder.value ? `${currentFolder.value}/${name}` : name,
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const { filters, update, reset } = useResourceFilters()

const visible = computed<Resource[]>(() => applyFilters(folderResources.value, filters.value))
</script>
