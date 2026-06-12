<script setup lang="ts">
// Admin-only affordance: Studio's activation plugin verifies the session
// cookie against /__nuxt_studio/auth/session and stores the logged-in editor
// in the 'studio-session' state (see nuxt-studio runtime/utils/activation.js).
// It stays null for regular visitors. Local dev (where Studio activates with
// a stub user without setting that state) always shows the button.
const studioUser = useState<{ email?: string } | null>('studio-session', () => null);
const visible = computed(() => import.meta.dev || Boolean(studioUser.value?.email));
const open = ref(false);
</script>

<template>
  <ClientOnly>
    <template v-if="visible">
      <UTooltip text="Resource files">
        <button
          type="button"
          aria-label="Open resource files panel"
          class="fixed bottom-6 right-12 left-auto! z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[var(--ck-indigo)] text-white shadow-lg transition-transform hover:scale-105"
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
