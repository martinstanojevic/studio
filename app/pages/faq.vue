<script setup lang="ts">
const { data: page } = await useAsyncData('teaching-resources-faq', () =>
  queryCollection('teachingResourcesPages').path('/faq').first(),
);

useSeoMeta({
  title: () => page.value?.title ?? 'FAQ',
  description: () => page.value?.description,
});
</script>

<template>
  <div class="mx-auto max-w-[1200px] px-7 py-10">
    <ContentRenderer v-if="page" :value="page" />
  </div>
</template>
