<script setup lang="ts">
import {
  RESOURCE_TYPES,
  BOOK_CODES,
  type BookCode,
  type TeachingResourceItem,
} from '#shared/types/teaching-resources';

useSeoMeta({
  title: 'Advanced search — Teaching Resources',
  description: 'Search, select, and download CourseKata teaching materials.',
});

const {
  page,
  search,
  activeType,
  bookCode,
  chapter,
  items,
  availableChapters,
  totalItems,
  totalPages,
  status,
  setPage,
  toggleType,
  setType,
  setBook,
} = useTeachingResources();

const viewMode = ref<'tiles' | 'list'>('tiles');
const selectedResource = ref<TeachingResourceItem | null>(null);
const selectedSlugs = ref(new Set<string>());

function openDetail(resource: TeachingResourceItem) {
  selectedResource.value = resource;
}

const selectionMode = computed(() => selectedSlugs.value.size > 0);

function toggleSelect(slug: string) {
  const next = new Set(selectedSlugs.value);
  if (next.has(slug)) next.delete(slug);
  else next.add(slug);
  selectedSlugs.value = next;
}

function clearSelection() {
  selectedSlugs.value = new Set();
}

function downloadSelected() {
  for (const slug of selectedSlugs.value) {
    const resource = items.value.find((r) => r.slug === slug);
    if (!resource?.file) continue;
    const a = document.createElement('a');
    a.href = resource.file;
    a.download = resource.file.split('/').pop() ?? '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

watch([search, activeType, bookCode, chapter, page], () => {
  clearSelection();
});

const searchInputRef = ref<{ inputRef?: HTMLInputElement } | null>(null);

onMounted(() => {
  document.addEventListener('keydown', handleSlashFocus);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleSlashFocus);
});

function handleSlashFocus(e: KeyboardEvent) {
  if (e.key !== '/') return;
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  e.preventDefault();
  searchInputRef.value?.inputRef?.focus();
}

const chapterItems = computed(() => [
  { label: 'All chapters', value: null as string | null },
  ...availableChapters.value.map((c) => ({ label: c, value: c as string | null })),
]);
</script>

<template>
  <div class="mx-auto max-w-[1400px] px-7 py-8">
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="page-title">Advanced <span class="page-title-accent">Search</span></h1>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">
          Filter, multi-select, and bulk download teaching resources.
        </p>
      </div>
      <NuxtLink
        to="/resources"
        class="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--ck-primary)]"
      >
        ← Back to resources
      </NuxtLink>
    </div>

    <!-- Search + view toggle -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <UInput
        ref="searchInputRef"
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search resources..."
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

      <USelectMenu
        v-model="chapter"
        :items="chapterItems"
        value-key="value"
        placeholder="All chapters"
        class="w-48"
      />

      <div class="flex-1" />

      <!-- View mode toggle -->
      <div
        class="inline-flex overflow-hidden rounded-full border-[1.5px] border-[var(--border-light)]"
      >
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            viewMode === 'tiles'
              ? 'bg-(--ck-primary-light) text-(--ck-primary)'
              : 'bg-white text-(--text-secondary) hover:text-(--ck-primary)'
          "
          aria-label="Tile view"
          @click="viewMode = 'tiles'"
        >
          <UIcon name="i-lucide-grid-3x3" class="h-3.5 w-3.5" />
          Tiles
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
          :class="
            viewMode === 'list'
              ? 'bg-(--ck-primary-light) text-(--ck-primary)'
              : 'bg-white text-(--text-secondary) hover:text-(--ck-primary)'
          "
          aria-label="List view"
          @click="viewMode = 'list'"
        >
          <UIcon name="i-lucide-list" class="h-3.5 w-3.5" />
          List
        </button>
      </div>

      <span class="text-xs text-[var(--text-tertiary)]">
        <strong class="font-semibold text-[var(--text-secondary)]">{{ totalItems }}</strong>
        resources
      </span>
    </div>

    <!-- Book chips -->
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <span
        class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)] mr-1"
      >
        Book
      </span>
      <button
        class="text-xs px-3 py-[5px] rounded-full border-[1.5px] cursor-pointer transition-all duration-150"
        :class="
          !bookCode
            ? 'border-(--ck-primary) text-(--ck-primary) bg-(--ck-primary-light) font-semibold'
            : 'border-(--border-light) bg-white text-(--text-secondary) font-medium hover:border-(--ck-primary-mid) hover:text-(--ck-primary)'
        "
        @click="setBook(null)"
      >
        All
      </button>
      <button
        v-for="code in BOOK_CODES"
        :key="code"
        class="text-xs px-3 py-[5px] rounded-full border-[1.5px] cursor-pointer transition-all duration-150 font-mono"
        :class="
          bookCode === code
            ? 'border-(--ck-primary) text-(--ck-primary) bg-(--ck-primary-light) font-semibold'
            : 'border-(--border-light) bg-white text-(--text-secondary) font-medium hover:border-(--ck-primary-mid) hover:text-(--ck-primary)'
        "
        @click="setBook(bookCode === code ? null : (code as BookCode))"
      >
        {{ code }}
      </button>
    </div>

    <!-- Type chips -->
    <div class="mb-6 flex flex-wrap items-center gap-2">
      <span
        class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)] mr-1"
      >
        Type
      </span>
      <button
        class="text-xs px-3 py-[5px] rounded-full border-[1.5px] cursor-pointer transition-all duration-150"
        :class="
          !activeType
            ? 'border-(--ck-primary) text-(--ck-primary) bg-(--ck-primary-light) font-semibold'
            : 'border-(--border-light) bg-white text-(--text-secondary) font-medium hover:border-(--ck-primary-mid) hover:text-(--ck-primary)'
        "
        @click="setType(null)"
      >
        All
      </button>
      <button
        v-for="rt in RESOURCE_TYPES"
        :key="rt.value"
        class="text-xs px-3 py-[5px] rounded-full border-[1.5px] cursor-pointer transition-all duration-150"
        :class="
          activeType === rt.value
            ? 'border-(--ck-primary) text-(--ck-primary) bg-(--ck-primary-light) font-semibold'
            : 'border-(--border-light) bg-white text-(--text-secondary) font-medium hover:border-(--ck-primary-mid) hover:text-(--ck-primary)'
        "
        @click="toggleType(rt.value)"
      >
        {{ rt.label }}
      </button>
    </div>

    <!-- Loading state -->
    <div
      v-if="status === 'pending' && items.length === 0"
      class="py-20 text-center text-sm text-[var(--text-tertiary)]"
    >
      Loading resources…
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="py-20 text-center">
      <UIcon name="i-lucide-search-x" class="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
      <p class="text-sm text-[var(--text-secondary)]">No resources found.</p>
      <p class="mt-1 text-xs text-[var(--text-tertiary)]">Try adjusting your search or filters.</p>
    </div>

    <!-- Tile grid -->
    <div
      v-else-if="viewMode === 'tiles'"
      class="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4"
    >
      <TeachingResourcesResourceCard
        v-for="resource in items"
        :key="resource.slug"
        :resource="resource"
        selectable
        :selected="selectedSlugs.has(resource.slug)"
        :selection-mode="selectionMode"
        @click="openDetail(resource)"
        @toggle-select="toggleSelect(resource.slug)"
      />
    </div>

    <!-- List view -->
    <div v-else class="flex flex-col gap-2">
      <TeachingResourcesResourceRow
        v-for="resource in items"
        :key="resource.slug"
        :resource="resource"
        selectable
        :selected="selectedSlugs.has(resource.slug)"
        :selection-mode="selectionMode"
        @click="openDetail(resource)"
        @toggle-select="toggleSelect(resource.slug)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
      <UButton
        variant="outline"
        size="sm"
        :disabled="page <= 1"
        icon="i-lucide-chevron-left"
        aria-label="Previous page"
        @click="setPage(page - 1)"
      />
      <span class="text-sm text-[var(--text-secondary)]">
        Page {{ page }} of {{ totalPages }}
      </span>
      <UButton
        variant="outline"
        size="sm"
        :disabled="page >= totalPages"
        icon="i-lucide-chevron-right"
        aria-label="Next page"
        @click="setPage(page + 1)"
      />
    </div>

    <!-- Detail panel -->
    <TeachingResourcesResourceDetailPanel
      :resource="selectedResource"
      @close="selectedResource = null"
    />

    <!-- Batch action bar -->
    <TeachingResourcesResourceBatchBar
      :selected-count="selectedSlugs.size"
      @clear="clearSelection"
      @download="downloadSelected"
    />
  </div>
</template>
