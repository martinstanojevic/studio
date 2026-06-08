<script setup lang="ts">
import type { TeachingResourceItem } from '#shared/types/teaching-resources';
import { getResourceTypeConfig } from '#shared/types/teaching-resources';

const props = defineProps<{
  resource: TeachingResourceItem;
  selected?: boolean;
  selectionMode?: boolean;
  selectable?: boolean;
}>();

defineEmits<{
  click: [];
  'toggle-select': [];
}>();

const typeConfig = computed(() => getResourceTypeConfig(props.resource.type));

const formattedDuration = computed(() => {
  if (!props.resource.duration) return null;
  return `${props.resource.duration} min`;
});

const showCheckbox = computed(() => props.selected || props.selectionMode);
</script>

<template>
  <div
    :class="[
      'group relative flex w-full items-center gap-4 overflow-hidden rounded-[10px] border-[1.5px] bg-white px-4 py-3 text-left transition-all',
      selected
        ? 'border-[var(--ck-primary-mid)] shadow-[0_0_0_1px_var(--ck-primary-mid)]'
        : 'border-[var(--border-light)] hover:border-[var(--ck-primary-mid)] hover:shadow-[0_2px_8px_rgba(30,10,70,0.06)]',
    ]"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <!-- Type stripe (left) -->
    <div :class="['absolute top-0 bottom-0 left-0 w-[3px]', typeConfig.stripeClass]" />

    <!-- Selection checkbox -->
    <div
      v-if="selectable"
      :class="[
        'shrink-0 transition-opacity',
        showCheckbox ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
      ]"
      @click.stop
    >
      <UCheckbox
        :model-value="!!selected"
        aria-label="Select resource"
        @update:model-value="$emit('toggle-select')"
      />
    </div>

    <!-- Type badge -->
    <span
      :class="[
        'shrink-0 rounded-[4px] px-2 py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.08em]',
        typeConfig.badgeBg,
        typeConfig.badgeText,
      ]"
    >
      {{ typeConfig.label }}
    </span>

    <!-- Title + description -->
    <div class="min-w-0 flex-1">
      <div class="font-display truncate text-sm font-semibold text-[var(--ck-indigo)]">
        {{ resource.title }}
      </div>
      <div
        v-if="resource.description"
        class="mt-0.5 truncate text-[12px] text-[var(--text-secondary)]"
      >
        {{ resource.description }}
      </div>
    </div>

    <!-- Metadata -->
    <div class="hidden shrink-0 items-center gap-3 text-[11px] text-[var(--text-tertiary)] sm:flex">
      <span v-if="resource.chapter" class="flex items-center gap-1">
        <UIcon name="i-lucide-book-open" class="h-[13px] w-[13px]" />
        {{ resource.chapter }}
      </span>
      <span v-if="formattedDuration" class="flex items-center gap-1">
        <UIcon name="i-lucide-clock" class="h-[13px] w-[13px]" />
        {{ formattedDuration }}
      </span>
      <span v-if="resource.books.length > 0" class="font-mono">
        {{ resource.books.join(' · ') }}
      </span>
    </div>
  </div>
</template>
