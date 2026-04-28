<template>
  <aside class="space-y-5 sticky top-6">
    <div class="flex items-center justify-between">
      <h2 class="font-semibold">Filters</h2>
      <UButton
        v-if="active"
        size="xs"
        variant="ghost"
        label="Reset"
        @click="reset"
      />
    </div>

    <UFormField label="Type" class="w-full">
      <USelectMenu
        class="w-full"
        :model-value="filters.types"
        :items="typeOptions"
        multiple
        searchable
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ types: v })"
      />
    </UFormField>

    <UFormField label="Function">
      <USelectMenu
        class="w-full"
        :model-value="filters.functions"
        :items="functionOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ functions: v })"
      />
    </UFormField>

    <UFormField label="Modality">
      <USelectMenu
        class="w-full"
        :model-value="filters.modalities"
        :items="modalityOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ modalities: v })"
      />
    </UFormField>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Resource } from '~/types/resource'
import { isFilterActive } from '~/utils/filterResources'

const props = defineProps<{ resources: Resource[] }>()

const { filters, update, reset } = useResourceFilters()

function uniq<T>(arr: T[]): T[] { return [...new Set(arr)] }

const typeOptions = computed(() => uniq(props.resources.map(r => r.type)).sort())
const functionOptions = computed(() => uniq(props.resources.map(r => r.function)).sort())
const modalityOptions = computed(() => uniq(props.resources.map(r => r.modality)).sort())

const active = computed(() => isFilterActive(filters.value))
</script>
