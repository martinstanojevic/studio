<template>
  <USelectMenu
    :model-value="current"
    :items="options"
    value-key="value"
    label-key="label"
    @update:model-value="(v: any) => update({ sort: v })"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResourceFilters } from '~/utils/filterResources'

const { filters, update } = useResourceFilters()

const options: { label: string, value: ResourceFilters['sort'] }[] = [
  { label: 'Last updated', value: 'lastUpdated' },
  { label: 'Title (A–Z)', value: 'title' },
  { label: 'Length (short → long)', value: 'length' },
]

const current = computed(() => filters.value.sort)
</script>
