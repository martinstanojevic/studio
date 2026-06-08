<script setup lang="ts">
import type { TeachingResourceItem } from '#shared/types/teaching-resources';
import { getResourceTypeConfig } from '#shared/types/teaching-resources';

const props = defineProps<{
  resource: TeachingResourceItem | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const typeConfig = computed(() =>
  props.resource ? getResourceTypeConfig(props.resource.type) : null,
);

const formattedDuration = computed(() => {
  if (!props.resource?.duration) return null;
  return `${props.resource.duration} min`;
});

const fileName = computed(() => {
  if (!props.resource?.file) return null;
  return props.resource.file.split('/').pop() ?? null;
});

function handleOpenChange(val: boolean) {
  if (!val) emit('close');
}
</script>

<template>
  <USlideover :open="!!resource" side="right" @update:open="handleOpenChange">
    <template #header>
      <div class="flex items-start justify-between">
        <div class="font-display text-xl font-normal text-[var(--ck-indigo)]">
          {{ resource?.title ?? 'Resource Details' }}
        </div>
      </div>
    </template>

    <template #body>
      <template v-if="resource">
        <!-- Overview -->
        <div class="mb-5">
          <div
            class="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-primary"
          >
            Overview
          </div>
          <div v-if="typeConfig" class="mb-3">
            <span
              :class="[
                'inline-block rounded-[4px] px-2 py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.08em]',
                typeConfig.badgeBg,
                typeConfig.badgeText,
              ]"
            >
              {{ typeConfig.label }}
            </span>
          </div>
          <div v-if="resource.description">
            <label class="mb-0.5 block text-[11px] font-medium text-[var(--text-tertiary)]">
              Description
            </label>
            <div class="text-[13px] text-[var(--text-primary)]">{{ resource.description }}</div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="mb-5">
          <div
            class="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-primary"
          >
            Details
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div v-if="resource.books.length > 0">
              <label class="mb-0.5 block text-[11px] font-medium text-[var(--text-tertiary)]">
                Books
              </label>
              <div class="text-[13px] text-[var(--text-primary)]">
                {{ resource.books.join(', ') }}
              </div>
            </div>
            <div v-if="resource.chapter">
              <label class="mb-0.5 block text-[11px] font-medium text-[var(--text-tertiary)]">
                Chapter
              </label>
              <div class="text-[13px] text-[var(--text-primary)]">{{ resource.chapter }}</div>
            </div>
            <div v-if="formattedDuration">
              <label class="mb-0.5 block text-[11px] font-medium text-[var(--text-tertiary)]">
                Duration
              </label>
              <div class="text-[13px] text-[var(--text-primary)]">{{ formattedDuration }}</div>
            </div>
            <div v-if="fileName">
              <label class="mb-0.5 block text-[11px] font-medium text-[var(--text-tertiary)]">
                File
              </label>
              <div class="font-mono text-[11px] text-[var(--text-secondary)] break-all">
                {{ fileName }}
              </div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="resource.tags.length > 0" class="mb-5">
          <div
            class="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-primary"
          >
            Tags
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in resource.tags"
              :key="tag"
              class="rounded-full bg-[var(--bg-page)] px-2.5 py-[3px] text-[11px] font-medium text-[var(--text-secondary)]"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex flex-col gap-2">
          <a
            v-if="resource.file"
            :href="resource.file"
            download
            class="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[var(--ck-primary-mid)]"
          >
            <UIcon name="i-lucide-download" class="h-4 w-4" />
            Download Resource
          </a>
          <NuxtLink
            :to="`/resources/${resource.slug}`"
            class="inline-flex w-full items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[var(--border-light)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ck-indigo)] no-underline transition-colors hover:border-[var(--ck-primary-mid)] hover:text-[var(--ck-primary)]"
          >
            View full page
            <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </template>
    </template>
  </USlideover>
</template>
