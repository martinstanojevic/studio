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
      <p class="text-sm text-muted line-clamp-3 mb-3">{{ resource.description }}</p>
      <div class="flex items-center gap-3 text-xs text-muted">
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-clock" class="size-3.5" />
          {{ resource.lengthMinutes }} min
        </span>
        <span v-if="resource.dataset" class="flex items-center gap-1">
          <UIcon name="i-lucide-database" class="size-3.5" />
          {{ resource.dataset.name }}
        </span>
        <span v-if="resource.lastModified" class="ml-auto">{{ formatDate(resource.lastModified) }}</span>
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
