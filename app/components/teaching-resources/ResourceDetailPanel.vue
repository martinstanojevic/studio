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

const files = computed(() => props.resource?.files ?? []);

const bundleHref = computed(() =>
  props.resource ? `/api/resources/${props.resource.slug}/download` : '#',
);

function fileBaseName(path: string) {
  return decodeURIComponent(path.split('/').pop() ?? path);
}

function roleBadge(role: string | undefined) {
  if (role === 'teacher') return { label: 'Teacher', class: 'bg-[var(--ck-coral-light)] text-[#c43a5a]' };
  if (role === 'student') return { label: 'Student', class: 'bg-[var(--ck-primary-light)] text-[var(--ck-primary)]' };
  if (role === 'supplement') return { label: 'Supplement', class: 'bg-[var(--ck-teal-light)] text-[var(--ck-teal-dark)]' };
  return null;
}

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
          </div>
        </div>

        <!-- Attached files -->
        <div v-if="files.length > 0" class="mb-5">
          <div
            class="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-primary"
          >
            <span>Files · {{ files.length }}</span>
          </div>
          <ul class="divide-y divide-[var(--border-light)] rounded-[8px] border-[1.5px] border-[var(--border-light)] bg-white">
            <li
              v-for="f in files"
              :key="f.path"
              class="flex items-center gap-2 px-3 py-2"
            >
              <UIcon name="i-lucide-file" class="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[12px] font-medium text-[var(--text-primary)]">{{ f.label }}</span>
                  <span
                    v-if="roleBadge(f.role)"
                    :class="[
                      'rounded-[3px] px-1 py-[1px] font-mono text-[9px] font-semibold uppercase tracking-[0.06em]',
                      roleBadge(f.role)!.class,
                    ]"
                  >
                    {{ roleBadge(f.role)!.label }}
                  </span>
                </div>
                <div class="mt-0.5 font-mono text-[10px] text-[var(--text-tertiary)] break-all">
                  {{ fileBaseName(f.path) }}
                </div>
              </div>
              <a
                :href="f.path"
                download
                class="rounded-full p-1.5 text-[var(--text-secondary)] no-underline transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--ck-primary)]"
                aria-label="Download file"
              >
                <UIcon name="i-lucide-download" class="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>
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
            v-if="files.length > 0"
            :href="bundleHref"
            download
            class="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[var(--ck-primary-mid)]"
          >
            <UIcon name="i-lucide-download" class="h-4 w-4" />
            Download all (.zip)
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
