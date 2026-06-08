<script setup lang="ts">
import { getResourceTypeConfig } from '#shared/types/teaching-resources';

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data: detail } = await useAsyncData(
  () => `teaching-resource-${slug.value}`,
  () =>
    queryCollection('teachingResources')
      .path(`/resources/${slug.value}`)
      .first(),
  { watch: [slug] },
);

if (!detail.value) {
  throw createError({ statusCode: 404, statusMessage: 'Resource not found', fatal: true });
}

useSeoMeta({
  title: () => `${detail.value?.title ?? 'Resource'} — Teaching Resources`,
  description: () => detail.value?.description,
});

const typeConfig = computed(() => (detail.value ? getResourceTypeConfig(detail.value.type) : null));

const formattedDuration = computed(() => {
  if (!detail.value?.duration) return null;
  return `${detail.value.duration} min`;
});

const fileName = computed(() => {
  if (!detail.value?.file) return null;
  return detail.value.file.split('/').pop() ?? null;
});
</script>

<template>
  <div v-if="detail" class="mx-auto max-w-[900px] px-7 py-10">
    <!-- Back link -->
    <NuxtLink
      to="/resources"
      class="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--ck-primary)]"
    >
      ← Back to resources
    </NuxtLink>

    <!-- Header -->
    <div class="mb-6">
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
      <h1 class="font-display text-3xl font-semibold text-[var(--ck-indigo)]">
        {{ detail.title }}
      </h1>
      <p v-if="detail.description" class="mt-2 text-base text-[var(--text-secondary)]">
        {{ detail.description }}
      </p>
    </div>

    <!-- Metadata strip -->
    <div
      class="mb-3 flex flex-wrap gap-x-6 gap-y-2 rounded-[10px] border-[1.5px] border-[var(--border-light)] bg-white px-5 py-4 text-[13px]"
    >
      <div v-if="detail.books?.length">
        <span
          class="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]"
        >
          Books
        </span>
        <div class="mt-0.5 font-mono text-[var(--text-primary)]">
          {{ detail.books?.join(' · ') }}
        </div>
      </div>
      <div v-if="detail.chapter">
        <span
          class="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]"
        >
          Chapter
        </span>
        <div class="mt-0.5 text-[var(--text-primary)]">{{ detail.chapter }}</div>
      </div>
      <div v-if="formattedDuration">
        <span
          class="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]"
        >
          Duration
        </span>
        <div class="mt-0.5 text-[var(--text-primary)]">{{ formattedDuration }}</div>
      </div>
      <div v-if="fileName">
        <span
          class="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]"
        >
          File
        </span>
        <div class="mt-0.5 font-mono text-[11px] text-[var(--text-secondary)] break-all">
          {{ fileName }}
        </div>
      </div>
    </div>

    <!-- Dataset info -->
    <div v-if="detail.datasetName">
      <h2 class="font-display mb-3 text-lg font-semibold text-[var(--ck-indigo)]">Dataset</h2>
      <div class="rounded-[10px] border-[1.5px] border-[var(--border-light)] bg-white px-5 py-4">
        <div class="font-semibold text-[var(--text-primary)]">{{ detail.datasetName }}</div>
        <p v-if="detail.datasetDescription" class="mt-1 text-sm text-[var(--text-secondary)]">
          {{ detail.datasetDescription }}
        </p>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="detail.tags?.length" class="mb-4">
      <div class="flex flex-wrap gap-1.5">
        <UBadge v-for="tag in detail.tags" :key="tag" variant="subtle">
          {{ tag }}
        </UBadge>
      </div>
    </div>

    <!-- Markdown body -->
    <div class="prose prose-sm max-w-none">
      <ContentRenderer :value="detail" />
    </div>
  </div>
</template>
