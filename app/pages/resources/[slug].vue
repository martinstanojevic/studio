<script setup lang="ts">
import { getResourceTypeConfig, type TeachingResourceFile } from '#shared/types/teaching-resources';

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

const files = computed<TeachingResourceFile[]>(() => detail.value?.files ?? []);

const bundleHref = computed(() => `/api/resources/${slug.value}/download`);

function fileBaseName(path: string) {
  return decodeURIComponent(path.split('/').pop() ?? path);
}

function roleBadge(role: string | undefined) {
  if (role === 'teacher') return { label: 'Teacher', class: 'bg-[var(--ck-coral-light)] text-[#c43a5a]' };
  if (role === 'student') return { label: 'Student', class: 'bg-[var(--ck-primary-light)] text-[var(--ck-primary)]' };
  if (role === 'supplement') return { label: 'Supplement', class: 'bg-[var(--ck-teal-light)] text-[var(--ck-teal-dark)]' };
  return null;
}
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

    <!-- Bundle download + per-file list -->
    <div
      v-if="files.length"
      class="mb-6 rounded-[10px] border-[1.5px] border-[var(--border-light)] bg-white px-5 py-4"
    >
      <div class="mb-3 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div class="font-display text-base font-semibold text-[var(--ck-indigo)]">
            Downloads
          </div>
          <div class="text-xs text-[var(--text-tertiary)]">
            {{ files.length }} {{ files.length === 1 ? 'file' : 'files' }} attached
          </div>
        </div>
        <a
          :href="bundleHref"
          download
          class="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[var(--ck-primary-mid)]"
        >
          <UIcon name="i-lucide-download" class="h-4 w-4" />
          Download all (.zip)
        </a>
      </div>

      <ul class="divide-y divide-[var(--border-light)]">
        <li
          v-for="f in files"
          :key="f.path"
          class="flex items-center gap-3 py-2.5"
        >
          <UIcon name="i-lucide-file" class="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[13px] font-medium text-[var(--text-primary)]">{{ f.label }}</span>
              <span
                v-if="roleBadge(f.role)"
                :class="[
                  'rounded-[4px] px-1.5 py-[1px] font-mono text-[10px] font-semibold uppercase tracking-[0.06em]',
                  roleBadge(f.role)!.class,
                ]"
              >
                {{ roleBadge(f.role)!.label }}
              </span>
            </div>
            <div class="mt-0.5 font-mono text-[11px] text-[var(--text-tertiary)] break-all">
              {{ fileBaseName(f.path) }}
            </div>
          </div>
          <a
            :href="f.path"
            download
            class="inline-flex items-center gap-1 rounded-full border-[1.5px] border-[var(--border-light)] bg-white px-3 py-1 text-xs font-medium text-[var(--ck-indigo)] no-underline transition-colors hover:border-[var(--ck-primary-mid)] hover:text-[var(--ck-primary)]"
          >
            <UIcon name="i-lucide-download" class="h-3.5 w-3.5" />
            Download
          </a>
        </li>
      </ul>
    </div>

    <!-- Metadata strip -->
    <div
      class="mb-6 flex flex-wrap gap-x-6 gap-y-2 rounded-[10px] border-[1.5px] border-[var(--border-light)] bg-white px-5 py-4 text-[13px]"
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
    </div>

    <!-- Dataset info -->
    <div v-if="detail.datasetName" class="mb-6">
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
