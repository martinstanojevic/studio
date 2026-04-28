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

    <UFormField label="Type">
      <USelectMenu
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
        :model-value="filters.functions"
        :items="functionOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ functions: v })"
      />
    </UFormField>

    <UFormField label="Modality">
      <USelectMenu
        :model-value="filters.modalities"
        :items="modalityOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ modalities: v })"
      />
    </UFormField>

    <UFormField label="Coverage">
      <USelectMenu
        :model-value="filters.coverages"
        :items="coverageOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ coverages: v })"
      />
    </UFormField>

    <UFormField label="Textbook version">
      <USelectMenu
        :model-value="filters.textbookVersions"
        :items="textbookVersionOptions"
        multiple
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ textbookVersions: v })"
      />
    </UFormField>

    <UFormField label="Topic tags">
      <USelectMenu
        :model-value="filters.topicTags"
        :items="topicTagOptions"
        multiple
        searchable
        placeholder="Any"
        @update:model-value="(v: string[]) => update({ topicTags: v })"
      />
    </UFormField>

    <UFormField label="Length (minutes)">
      <div class="flex items-center gap-2">
        <UInput
          type="number"
          :model-value="filters.lengthMin ?? undefined"
          placeholder="Min"
          class="flex-1"
          @update:model-value="(v: any) => update({ lengthMin: v === '' || v == null ? null : Number(v) })"
        />
        <span class="text-muted">–</span>
        <UInput
          type="number"
          :model-value="filters.lengthMax ?? undefined"
          placeholder="Max"
          class="flex-1"
          @update:model-value="(v: any) => update({ lengthMax: v === '' || v == null ? null : Number(v) })"
        />
      </div>
    </UFormField>

    <UFormField label="Extra materials needed">
      <USelectMenu
        :model-value="extraMaterialsValue"
        :items="extraMaterialsOptions"
        placeholder="Any"
        @update:model-value="onExtraMaterialsChange"
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
const coverageOptions = computed(() => uniq(props.resources.map(r => r.coverage)).sort())
const textbookVersionOptions = computed(() => uniq(props.resources.flatMap(r => r.textbookVersions)).sort())
const topicTagOptions = computed(() => uniq(props.resources.flatMap(r => r.topicTags)).sort())

const active = computed(() => isFilterActive(filters.value))

const extraMaterialsOptions = ['Any', 'Required', 'Not required']
const extraMaterialsValue = computed(() => {
  if (filters.value.requiresExtraMaterials === true) return 'Required'
  if (filters.value.requiresExtraMaterials === false) return 'Not required'
  return 'Any'
})
function onExtraMaterialsChange(v: string) {
  update({
    requiresExtraMaterials: v === 'Required' ? true : v === 'Not required' ? false : null,
  })
}
</script>
