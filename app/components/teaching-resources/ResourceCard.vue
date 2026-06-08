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
      'resource-card group relative w-full cursor-pointer overflow-hidden rounded-[14px] border-[1.5px] bg-white p-[22px] text-left transition-all',
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
    <!-- Type stripe -->
    <div :class="['absolute top-0 right-0 left-0 h-[3px]', typeConfig.stripeClass]" />

    <!-- Selection checkbox -->
    <div
      v-if="selectable"
      :class="[
        'absolute top-2.5 right-2.5 z-10 transition-opacity',
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
        'mb-2.5 inline-block rounded-[4px] px-2 py-[3px] font-mono text-[10px] font-semibold uppercase tracking-[0.08em]',
        typeConfig.badgeBg,
        typeConfig.badgeText,
      ]"
    >
      {{ typeConfig.label }}
    </span>

    <!-- Title -->
    <h3 class="font-display mb-1.5 text-base font-semibold leading-[1.3] text-[var(--ck-indigo)]">
      {{ resource.title }}
    </h3>

    <!-- Description (2-line clamp) -->
    <p
      v-if="resource.description"
      class="mb-3.5 line-clamp-2 text-[13px] leading-[1.5] text-[var(--text-secondary)]"
    >
      {{ resource.description }}
    </p>

    <!-- Metadata row -->
    <div
      v-if="formattedDuration || resource.chapter"
      class="mb-3 flex flex-wrap gap-3 text-[11px] text-[var(--text-tertiary)]"
    >
      <span v-if="formattedDuration" class="flex items-center gap-1">
        <UIcon name="i-lucide-clock" class="h-[13px] w-[13px]" />
        {{ formattedDuration }}
      </span>
      <span v-if="resource.chapter" class="flex items-center gap-1">
        <UIcon name="i-lucide-book-open" class="h-[13px] w-[13px]" />
        {{ resource.chapter }}
      </span>
    </div>

    <!-- Tags -->
    <div v-if="resource.tags.length > 0" class="flex flex-wrap gap-1.5">
      <span
        v-for="tag in resource.tags"
        :key="tag"
        class="rounded-full bg-[var(--bg-page)] px-2 py-[2px] text-[10px] font-medium text-[var(--text-tertiary)]"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>
