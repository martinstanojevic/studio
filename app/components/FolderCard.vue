<template>
  <UCard
    :ui="{ body: 'p-4' }"
    class="hover:border-primary transition-colors h-full"
  >
    <NuxtLink :to="{ path: '/', query: { folder } }" class="block flex items-center gap-3">
      <UIcon name="i-lucide-folder" class="size-8 text-primary shrink-0" />
      <div>
        <h3 class="font-semibold text-base leading-tight">{{ name }}</h3>
        <p class="text-xs text-muted mt-1">{{ count }} resource{{ count === 1 ? '' : 's' }}</p>
      </div>
    </NuxtLink>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  folder: string
  count: number
}>()
</script>
