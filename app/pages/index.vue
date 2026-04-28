<template>
  <div class="max-w-7xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-6">Resources ({{ data?.length ?? 0 }})</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ResourceCard v-for="r in data" :key="r.path" :resource="r as any" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useAsyncData('resources', () =>
  queryCollection('resources').all(),
)
</script>
