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
