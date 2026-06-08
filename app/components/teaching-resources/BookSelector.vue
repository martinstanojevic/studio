<script setup lang="ts">
import { BOOK_CODES, type BookCode } from '#shared/types/teaching-resources';

const selected = defineModel<BookCode | null>({ required: true });

function pick(code: BookCode) {
  selected.value = selected.value === code ? null : code;
}
</script>

<template>
  <div>
    <div
      class="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]"
    >
      Select book
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="code in BOOK_CODES"
        :key="code"
        type="button"
        class="font-mono text-sm font-semibold px-6 py-3 rounded-[10px] border-[1.5px] cursor-pointer transition-all duration-150 min-w-[88px]"
        :class="
          selected === code
            ? 'border-(--ck-primary) text-(--ck-primary) bg-(--ck-primary-light)'
            : 'border-(--border-light) bg-white text-(--text-secondary) hover:border-(--ck-primary-mid) hover:text-(--ck-primary)'
        "
        @click="pick(code)"
      >
        {{ code }}
      </button>
    </div>
  </div>
</template>
