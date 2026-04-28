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
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-clock" class="size-4" />
          {{ resource.lengthMinutes }} min
        </span>
        <span>Updated {{ formatDate(resource.lastUpdated) }}</span>
      </div>

      <p class="text-lg text-muted mb-8">{{ resource.shortDescription }}</p>

      <ContentRenderer v-if="resource" :value="resource" class="prose dark:prose-invert max-w-none" />
    </div>

    <aside class="space-y-5 lg:sticky lg:top-6 lg:self-start">
      <UCard>
        <dl class="space-y-3 text-sm">
          <DetailRow label="Function" :value="resource.function" />
          <DetailRow label="Modality" :value="resource.modality" />
          <DetailRow label="Coverage" :value="resource.coverage" />
          <DetailRow label="Textbook versions" :value="resource.textbookVersions.join(', ')" />
          <DetailRow
            label="Student data collection"
            :value="resource.studentDataCollectionRequired ? 'Required' : 'Not required'"
          />
          <DetailRow
            v-if="resource.extraMaterialsNeeded"
            label="Extra materials"
            :value="(resource.extraMaterialsList ?? []).join(', ') || 'Required (see notes)'"
          />
        </dl>
      </UCard>

      <UCard v-if="resource.learningGoals.length">
        <h3 class="font-semibold text-sm mb-3">Learning goals</h3>
        <ul class="space-y-2 text-sm list-disc list-inside text-muted">
          <li v-for="g in resource.learningGoals" :key="g">{{ g }}</li>
        </ul>
      </UCard>

      <UCard v-if="resource.dataset">
        <h3 class="font-semibold text-sm mb-3">Dataset</h3>
        <dl class="space-y-2 text-sm">
          <DetailRow label="Name" :value="resource.dataset.name" />
          <DetailRow label="Source" :value="resource.dataset.source" />
          <DetailRow label="Variables" :value="`${resource.dataset.variableCount} (${resource.dataset.variableTypes.join(', ')})`" />
          <DetailRow v-if="resource.dataset.topicTags.length" label="Tags" :value="resource.dataset.topicTags.join(', ')" />
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
const slug = computed(() => String(route.params.slug))

const { data: resource } = await useAsyncData(`resource-${slug.value}`, () =>
  queryCollection('resources').path(`/resources/${slug.value}`).first(),
) as { data: Ref<Resource | null> }

const backHref = computed(() => {
  const fromQuery = typeof route.query.from === 'string' ? route.query.from : ''
  return fromQuery || '/'
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>
