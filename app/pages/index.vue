<script setup lang="ts">
const { data: page } = await useAsyncData('teaching-resources-index', () =>
  queryCollection('teachingResourcesPages').path('/').first(),
);

useSeoMeta({
  title: () => page.value?.title ?? 'Teaching Resources',
  description: () =>
    page.value?.description ??
    'Browse and download CourseKata teaching materials — notebooks, activities, worksheets, assessments, and datasets.',
});
</script>

<template>
  <div class="mx-auto max-w-[1200px] px-7 py-10">
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>
