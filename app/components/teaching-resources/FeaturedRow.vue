<script setup lang="ts">
import { getResourceTypeConfig, type TeachingResourceItem } from '#shared/types/teaching-resources';

const props = defineProps<{
  resources: TeachingResourceItem[];
}>();

const featuredTiles = computed(() =>
  props.resources
    .filter((r) => r.featured)
    .map((r) => ({
      key: r.slug,
      title: r.title,
      subtitle: `Featured ${getResourceTypeConfig(r.type).label}`,
      url: `/resources/${r.slug}`,
    })),
);
</script>

<template>
  <section v-if="featuredTiles.length > 0">
    <div
      class="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]"
    >
      Featured
    </div>
    <div class="grid grid-cols-4 gap-4">
      <TeachingResourcesFeaturedTile
        v-for="tile in featuredTiles"
        :key="tile.key"
        :title="tile.title"
        :subtitle="tile.subtitle"
        :url="tile.url"
      />
    </div>
  </section>
</template>
