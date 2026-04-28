<template>
  <UApp>
    <header class="border-b border-default">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="font-semibold text-lg">
          {{ appConfig.site?.title ?? 'CourseKata Resources' }}
        </NuxtLink>
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
  </UApp>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
</script>
