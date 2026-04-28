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
      <div class="flex items-center gap-2 text-xs text-muted">
        <UBadge :label="resource.function" variant="outline" size="sm" />
        <UBadge :label="resource.modality" variant="outline" size="sm" />
      </div>
    </NuxtLink>
  </UCard>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'

defineProps<{ resource: Resource }>()
</script>
