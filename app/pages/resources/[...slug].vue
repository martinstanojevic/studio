<template>
  <div v-if="resource" class="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-8">
    <div>
      <UButton
        :to="backHref"
        variant="ghost"
        size="sm"
        icon="i-lucide-arrow-left"
        label="Back to catalog"
        class="mb-4"
      />

      <h1 class="text-3xl font-semibold mb-2">{{ resource.title }}</h1>
      <div class="flex items-center gap-3 text-sm text-muted mb-6">
        <UBadge :label="resource.type" variant="soft" />
      </div>

      <p class="text-lg text-muted mb-8">{{ resource.description }}</p>

      <ContentRenderer v-if="resource" :value="resource" class="prose dark:prose-invert max-w-none" />
    </div>

    <aside class="space-y-5 lg:sticky lg:top-6 lg:self-start">
      <UCard>
        <dl class="space-y-3 text-sm">
          <DetailRow label="Function" :value="resource.function" />
          <DetailRow label="Modality" :value="resource.modality" />
        </dl>
      </UCard>
    </aside>
  </div>
  <div v-else class="max-w-3xl mx-auto p-6 text-center text-muted">
    Resource not found.
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '~/types/resource'

const route = useRoute()
const slug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? raw.join('/') : String(raw)
})

const { data: resource } = await useAsyncData(`resource-${slug.value}`, () =>
  queryCollection('resources').path(`/resources/${slug.value}`).first(),
) as { data: Ref<Resource | null> }

const backHref = computed(() => {
  const fromQuery = typeof route.query.from === 'string' ? route.query.from : ''
  return fromQuery || '/'
})

</script>
