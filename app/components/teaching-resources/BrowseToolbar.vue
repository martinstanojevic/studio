<script setup lang="ts">
import { RESOURCE_TYPES, type ResourceType } from '#shared/types/teaching-resources';

const props = defineProps<{
  availableChapters: string[];
}>();

const chapter = defineModel<string | null>('chapter', { required: true });
const type = defineModel<ResourceType | null>('type', { required: true });
const search = defineModel<string>('search', { required: true });

const chapterItems = computed(() => [
  { label: 'All chapters', value: null as string | null },
  ...props.availableChapters.map((c) => ({ label: c, value: c as string | null })),
]);

const typeItems = computed(() => [
  { label: 'All types', value: null as ResourceType | null },
  ...RESOURCE_TYPES.map((rt) => ({ label: rt.label, value: rt.value as ResourceType | null })),
]);

// Parent uses `/` to focus the search input; expose a focus method so it
// doesn't have to query the DOM directly.
const searchInputRef = ref<{ inputRef?: HTMLInputElement } | null>(null);

defineExpose({
  focusSearch() {
    searchInputRef.value?.inputRef?.focus();
  },
});
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3 rounded-[10px] bg-[var(--ck-primary-light)] px-5 py-3"
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

    <!-- Search input. Replaces the old "advanced search" toggle. -->
    <UInput
      ref="searchInputRef"
      v-model="search"
      icon="i-lucide-search"
      placeholder="Search resources…"
      class="w-72"
    >
      <template #trailing>
        <UKbd v-if="!search" value="/" />
        <UButton
          v-else
          color="neutral"
          variant="link"
          icon="i-lucide-x"
          size="sm"
          aria-label="Clear search"
          @click="search = ''"
        />
      </template>
    </UInput>
  </div>
</template>
