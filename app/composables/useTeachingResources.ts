import type {
  TeachingResourceItem,
  ResourceType,
  BookCode,
} from '#shared/types/teaching-resources';

const PAGE_SIZE = 20;

export function useTeachingResources() {
  // Filter state
  const page = ref(1);
  const search = ref('');
  const activeType = ref<ResourceType | null>(null);
  const bookCode = ref<BookCode | null>(null);
  const chapter = ref<string | null>(null);
  // Tag filter uses AND semantics: a resource must carry every selected tag.
  // Held as a Set so adds/removes are O(1) and reactivity is straightforward.
  const selectedTags = ref(new Set<string>());

  // Load all published resources once. With ≤ a few hundred resources, in-memory
  // filtering is simpler and faster than re-querying on every filter change.
  const { data, status, refresh } = useAsyncData('teaching-resources-all', () =>
    queryCollection('teachingResources').where('published', '=', true).all(),
  );

  const allItems = computed<TeachingResourceItem[]>(() =>
    (data.value ?? []).map((r) => ({
      slug: r.stem.replace(/^resources\//, ''),
      title: r.title,
      type: r.type,
      description: r.description,
      books: r.books ?? [],
      chapter: r.chapter,
      duration: r.duration,
      tags: r.tags ?? [],
      files: r.files ?? [],
      featured: r.featured ?? false,
    })),
  );

  // ── Two-stage filtering ────────────────────────────────────────────────────
  // We split filtering into "before tags" and "after tags" so the tag chip row
  // can derive its list of available tags from the pre-tag set. Otherwise
  // selecting a tag would prune the chip list — confusing UX where chips
  // disappear under the user's cursor.

  const preTagFiltered = computed<TeachingResourceItem[]>(() => {
    let result = allItems.value;

    if (bookCode.value) {
      const code = bookCode.value;
      result = result.filter((r) => r.books.length === 0 || r.books.includes(code));
    }

    if (activeType.value) {
      const t = activeType.value;
      result = result.filter((r) => r.type === t);
    }

    if (chapter.value) {
      const ch = chapter.value;
      result = result.filter((r) => r.chapter === ch);
    }

    if (search.value) {
      const q = search.value.toLowerCase();
      result = result.filter((r) => {
        if (r.title.toLowerCase().includes(q)) return true;
        if (r.description.toLowerCase().includes(q)) return true;
        if (r.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    return result;
  });

  const filteredItems = computed<TeachingResourceItem[]>(() => {
    if (selectedTags.value.size === 0) return preTagFiltered.value;
    return preTagFiltered.value.filter((r) =>
      // AND: resource must carry every selected tag.
      [...selectedTags.value].every((t) => r.tags.includes(t)),
    );
  });

  // Distinct chapter list, scoped to the currently selected book if any.
  const availableChapters = computed<string[]>(() => {
    const pool = bookCode.value
      ? allItems.value.filter(
          (r) => r.books.length === 0 || (bookCode.value && r.books.includes(bookCode.value)),
        )
      : allItems.value;
    const set = new Set<string>();
    for (const r of pool) {
      if (r.chapter) set.add(r.chapter);
    }
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  });

  // Tag chips are derived from the pre-tag set so they don't disappear when
  // the user clicks one. Sorted alphabetically for a stable strip.
  const availableTags = computed<string[]>(() => {
    const set = new Set<string>();
    for (const r of preTagFiltered.value) {
      for (const t of r.tags) set.add(t);
    }
    return [...set].sort();
  });

  const totalItems = computed(() => filteredItems.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / PAGE_SIZE)));

  const items = computed<TeachingResourceItem[]>(() => {
    const start = (page.value - 1) * PAGE_SIZE;
    return filteredItems.value.slice(start, start + PAGE_SIZE);
  });

  // Reset page to 1 whenever a filter changes.
  watch([search, activeType, bookCode, chapter, selectedTags], () => {
    page.value = 1;
  }, { deep: true });

  function setPage(newPage: number) {
    page.value = newPage;
  }

  function setType(type: ResourceType | null) {
    activeType.value = type;
  }

  function toggleType(type: ResourceType) {
    activeType.value = activeType.value === type ? null : type;
  }

  function setBook(code: BookCode | null) {
    bookCode.value = code;
    // Clear chapter when book changes — chapter list is book-scoped.
    chapter.value = null;
  }

  function setChapter(value: string | null) {
    chapter.value = value;
  }

  function toggleTag(tag: string) {
    // Replace the Set so reactivity fires (mutating in place doesn't trigger
    // computed re-eval reliably across all Vue versions).
    const next = new Set(selectedTags.value);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    selectedTags.value = next;
  }

  function clearTags() {
    selectedTags.value = new Set();
  }

  return {
    page,
    pageSize: PAGE_SIZE,
    search,
    activeType,
    bookCode,
    chapter,
    selectedTags,
    items,
    filteredItems,
    allItems,
    availableChapters,
    availableTags,
    totalItems,
    totalPages,
    status,
    setPage,
    setType,
    toggleType,
    setBook,
    setChapter,
    toggleTag,
    clearTags,
    refresh,
  };
}
