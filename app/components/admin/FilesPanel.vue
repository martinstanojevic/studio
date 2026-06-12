<script setup lang="ts">
// Admin-only affordance: the button shows when the site runs inside an iframe
// (Studio's preview, where admins do their editing) or in local dev. Regular
// visitors never see it.
const visible = ref(false);
const open = ref(false);

onMounted(() => {
  visible.value = import.meta.dev || window.self !== window.top;
});
</script>

<template>
  <ClientOnly>
    <template v-if="visible">
      <UTooltip text="Resource files">
        <button
          type="button"
          aria-label="Open resource files panel"
          class="fixed bottom-6 right-12 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--ck-indigo)] text-white shadow-lg transition-transform hover:scale-105"
          @click="open = true"
        >
          <UIcon name="i-lucide-folder-open" class="h-5 w-5" />
        </button>
      </UTooltip>

      <USlideover
        v-model:open="open"
        side="right"
        title="Resource files"
        description="Copy a path and paste it into the resource's Files → Src field in Studio's page settings."
      >
        <template #body>
          <AdminFilesList />
        </template>
      </USlideover>
    </template>
  </ClientOnly>
</template>
