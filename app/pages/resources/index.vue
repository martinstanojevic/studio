<script setup lang="ts">
import type {
  BookCode,
  ResourceType,
  TeachingResourceItem,
} from '#shared/types/teaching-resources';

useSeoMeta({
  title: 'Teaching Resources',
  description:
    'Browse and download CourseKata teaching materials — notebooks, activities, worksheets, assessments, and datasets.',
});

const {
  page,
  search,
  activeType,
  bookCode,
  chapter,
  items,
  allItems,
  availableChapters,
  totalItems,
  totalPages,
  status,
  setPage,
  setType,
  setBook,
  setChapter,
} = useTeachingResources();

// ── View / selection state ─────────────────────────────────────────────────
const viewMode = ref<'tiles' | 'list'>('tiles');
const selectedSlugs = ref(new Set<string>());

// Selection mode = "the user has at least one item selected." In this mode
// card clicks toggle selection (Gmail-style) instead of navigating, and the
// batch bar shows.
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

// Any filter change clears in-flight selection so the user isn't operating
// on items that scrolled out of view.
watch([search, activeType, bookCode, chapter, page], () => {
  clearSelection();
});

function onCardActivate(resource: TeachingResourceItem) {
  if (selectionMode.value) {
    toggleSelect(resource.slug);
  } else {
    navigateTo(`/resources/${resource.slug}`);
  }
}

// ── Two-way binding shims for child components ──────────────────────────────
const bookModel = computed<BookCode | null>({
  get: () => bookCode.value,
  set: (v) => setBook(v),
});
const chapterModel = computed<string | null>({
  get: () => chapter.value,
  set: (v) => setChapter(v),
});
const typeModel = computed<ResourceType | null>({
  get: () => activeType.value,
  set: (v) => setType(v),
});

// ── Bulk download flow ─────────────────────────────────────────────────────
const toast = useToast();
const downloading = ref(false);

async function downloadOne(slug: string) {
  const res = await fetch(`/api/resources/${slug}/download`);
  if (!res.ok) {
    let body = '';
    try {
      body = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(`${slug}: HTTP ${res.status}${body ? ' — ' + body.slice(0, 120) : ''}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

async function downloadSelected() {
  if (downloading.value) return;
  const slugs = [...selectedSlugs.value];
  if (!slugs.length) return;

  downloading.value = true;
  try {
    const results = await Promise.allSettled(slugs.map((s) => downloadOne(s)));
    const failed = results
      .map((r, i) => (r.status === 'rejected' ? slugs[i] : null))
      .filter((s): s is string => !!s);

    if (failed.length === 0) {
      toast.add({
        title: `Downloaded ${slugs.length} ${slugs.length === 1 ? 'resource' : 'resources'}`,
        description: 'Check your downloads folder.',
        color: 'success',
        icon: 'i-lucide-check',
      });
    } else if (failed.length < slugs.length) {
      toast.add({
        title: `${slugs.length - failed.length} of ${slugs.length} downloads completed`,
        description: `Failed: ${failed.join(', ')}`,
        color: 'warning',
        icon: 'i-lucide-alert-triangle',
      });
    } else {
      toast.add({
        title: 'Downloads failed',
        description: failed.join(', '),
        color: 'error',
        icon: 'i-lucide-x',
      });
    }
  } finally {
    downloading.value = false;
  }
}

// ── '/' keyboard shortcut to focus search ──────────────────────────────────
const toolbarRef = ref<{ focusSearch: () => void } | null>(null);

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
  toolbarRef.value?.focusSearch();
}

// Hide the featured row once the user starts searching — it becomes visual
// noise once they've expressed a specific intent.
const isSearching = computed(() => !!search.value);
</script>

<template>
  <div class="mx-auto max-w-[1200px] px-7 py-10">
    <!-- Page header -->
    <div class="mb-8">
      <h1>Teaching <span>Resources</span></h1>
      <p class="mt-1 text-sm text-[var(--text-secondary)]">
        Browse and download teaching materials for your courses.
      </p>
    </div>

    <!-- Book selector -->
    <div class="mb-6">
      <TeachingResourcesBookSelector v-model="bookModel" />
    </div>

    <!-- Browse toolbar (chapter + type + search) -->
    <div class="mb-8">
      <TeachingResourcesBrowseToolbar
        ref="toolbarRef"
        v-model:chapter="chapterModel"
        v-model:type="typeModel"
        v-model:search="search"
        :available-chapters="availableChapters"
      />
    </div>

    <!-- Featured row (hidden once user starts searching) -->
    <div v-if="!isSearching" class="mb-10">
      <TeachingResourcesFeaturedRow :resources="allItems" />
    </div>

    <!-- Resource grid header: title + view toggle + count -->
    <div class="mb-4 flex items-center justify-between gap-3 flex-wrap">
      <h2 class="font-display text-xl font-semibold text-[var(--ck-indigo)]">All resources</h2>
      <div class="flex items-center gap-3">
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
    </div>

    <!-- Loading state -->
    <div
      v-if="status === 'pending' && items.length === 0"
      class="py-16 text-center text-sm text-[var(--text-tertiary)]"
    >
      Loading resources…
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="py-16 text-center">
      <UIcon name="i-lucide-search-x" class="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
      <p class="text-sm text-[var(--text-secondary)]">No resources match your filters.</p>
      <p class="mt-1 text-xs text-[var(--text-tertiary)]">
        Try a different book, chapter, type, or search term.
      </p>
    </div>

    <!-- Tile grid -->
    <div
      v-else-if="viewMode === 'tiles'"
      class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4"
    >
      <TeachingResourcesResourceCard
        v-for="resource in items"
        :key="resource.slug"
        :resource="resource"
        selectable
        :selected="selectedSlugs.has(resource.slug)"
        :selection-mode="selectionMode"
        @click="onCardActivate(resource)"
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
        @click="onCardActivate(resource)"
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

    <!-- Batch action bar (auto-hides when 0 selected) -->
    <TeachingResourcesResourceBatchBar
      :selected-count="selectedSlugs.size"
      @clear="clearSelection"
      @download="downloadSelected"
    />
  </div>
</template>
