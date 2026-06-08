<script setup lang="ts">
const { data: page } = await useAsyncData('teaching-resources-datasets', () =>
  queryCollection('teachingResourcesPages').path('/datasets').first(),
);

useSeoMeta({
  title: () => page.value?.title ?? 'Datasets',
  description: () => page.value?.description,
});
</script>

<template>
  <div class="mx-auto max-w-[1200px] px-7 py-10">
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>
