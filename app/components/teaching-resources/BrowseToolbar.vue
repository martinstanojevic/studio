<script setup lang="ts">
import { RESOURCE_TYPES, type ResourceType } from '#shared/types/teaching-resources';

const props = defineProps<{
  availableChapters: string[];
}>();

const chapter = defineModel<string | null>('chapter', { required: true });
const type = defineModel<ResourceType | null>('type', { required: true });

const chapterItems = computed(() => [
  { label: 'All chapters', value: null as string | null },
  ...props.availableChapters.map((c) => ({ label: c, value: c as string | null })),
]);

const typeItems = computed(() => [
  { label: 'All types', value: null as ResourceType | null },
  ...RESOURCE_TYPES.map((rt) => ({ label: rt.label, value: rt.value as ResourceType | null })),
]);
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-4 rounded-[10px] bg-[var(--ck-primary-light)] px-5 py-3"
  >
    <span class="text-sm font-semibold text-[var(--ck-indigo)]">browse resources</span>

    <USelectMenu
      v-model="chapter"
      :items="chapterItems"
      value-key="value"
      placeholder="by chapter"
      class="w-44"
      variant="ghost"
    />

    <USelectMenu
      v-model="type"
      :items="typeItems"
      value-key="value"
      placeholder="by type"
      class="w-44"
      variant="ghost"
    />

    <div class="flex-1" />

    <NuxtLink
      to="/resources/search"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ck-indigo)] no-underline hover:text-[var(--ck-primary)]"
    >
      advanced search
      <UIcon name="i-lucide-search" class="h-4 w-4" />
    </NuxtLink>
  </div>
</template>
