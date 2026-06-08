<script setup lang="ts">
import type { BookCode, ResourceType } from '#shared/types/teaching-resources';

useSeoMeta({
  title: 'Teaching Resources',
  description:
    'Browse and download CourseKata teaching materials — notebooks, activities, worksheets, assessments, and datasets.',
});

const {
  page,
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

// Two-way binding shims for child components.
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

    <!-- Browse toolbar -->
    <div class="mb-8">
      <TeachingResourcesBrowseToolbar
        v-model:chapter="chapterModel"
        v-model:type="typeModel"
        :available-chapters="availableChapters"
      />
    </div>

    <!-- Featured row -->
    <div class="mb-10">
      <TeachingResourcesFeaturedRow :resources="allItems" />
    </div>

    <!-- Resource grid -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-display text-xl font-semibold text-[var(--ck-indigo)]">All resources</h2>
      <span class="text-xs text-[var(--text-tertiary)]">
        <strong class="font-semibold text-[var(--text-secondary)]">{{ totalItems }}</strong>
        resources
      </span>
    </div>

    <div
      v-if="status === 'pending' && items.length === 0"
      class="py-16 text-center text-sm text-[var(--text-tertiary)]"
    >
      Loading resources…
    </div>

    <div v-else-if="items.length === 0" class="py-16 text-center">
      <UIcon name="i-lucide-search-x" class="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
      <p class="text-sm text-[var(--text-secondary)]">No resources match your filters.</p>
      <p class="mt-1 text-xs text-[var(--text-tertiary)]">
        Try a different book, chapter, or type.
      </p>
    </div>

    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
      <TeachingResourcesResourceCard
        v-for="resource in items"
        :key="resource.slug"
        :resource="resource"
        @click="navigateTo(`/resources/${resource.slug}`)"
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
  </div>
</template>
