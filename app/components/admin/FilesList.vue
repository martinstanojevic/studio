<script setup lang="ts">
import type { ResourceFileEntry } from '#shared/types/admin-files';

// No await: an async setup would require a <Suspense> boundary, which exists
// on pages but not when this component mounts inside the slideover.
const { data: files, status } = useFetch<ResourceFileEntry[]>('/api/admin/files', {
  key: 'admin-resource-files',
});

const search = ref('');
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  const list = files.value ?? [];
  if (!q) return list;
  return list.filter((f) => f.name.toLowerCase().includes(q));
});

const copiedPath = ref<string | null>(null);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

async function copyPath(path: string) {
  try {
    await navigator.clipboard.writeText(path);
  } catch {
    // Clipboard API can be blocked in iframes (Studio preview) — fall back to
    // the legacy selection-based copy.
    const ta = document.createElement('textarea');
    ta.value = path;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  copiedPath.value = path;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => {
    copiedPath.value = null;
  }, 1500);
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
</script>

<template>
  <div>
    <input
      v-model="search"
      type="search"
      placeholder="Filter by filename…"
      class="w-full rounded-[8px] border-[1.5px] border-[var(--border-light)] bg-white px-3.5 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--ck-primary-mid)]"
    >

    <div class="mt-4 rounded-[10px] border-[1.5px] border-[var(--border-light)] bg-white px-5 py-1">
      <ul v-if="filtered.length" class="divide-y divide-[var(--border-light)]">
        <li
          v-for="f in filtered"
          :key="f.path"
          class="flex items-center gap-3 py-3"
        >
          <UIcon name="i-lucide-file" class="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
          <div class="min-w-0 flex-1">
            <div class="text-[13px] font-medium text-[var(--text-primary)]">
              {{ f.name }}
            </div>
            <div class="mt-0.5 font-mono text-[11px] text-[var(--text-tertiary)] break-all">
              {{ f.path }}
            </div>
            <div class="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
              {{ formatSize(f.size) }} · {{ formatDate(f.modifiedAt) }}
            </div>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-[1.5px] border-[var(--border-light)] bg-white px-3 py-1 text-xs font-medium text-[var(--ck-indigo)] transition-colors hover:border-[var(--ck-primary-mid)] hover:text-[var(--ck-primary)]"
            @click="copyPath(f.path)"
          >
            <UIcon
              :name="copiedPath === f.path ? 'i-lucide-check' : 'i-lucide-copy'"
              class="h-3.5 w-3.5"
            />
            {{ copiedPath === f.path ? 'Copied' : 'Copy path' }}
          </button>
        </li>
      </ul>
      <p v-else class="py-4 text-sm text-[var(--text-tertiary)]">
        {{ status === 'pending' ? 'Loading…' : 'No files match.' }}
      </p>
    </div>
  </div>
</template>
