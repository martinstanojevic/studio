<script setup lang="ts">
defineProps<{
  selectedCount: number;
}>();

defineEmits<{
  clear: [];
  download: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div v-if="selectedCount > 0" class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div
          class="flex items-center gap-4 rounded-[14px] bg-[var(--ck-indigo)] px-5 py-3 shadow-[0_4px_24px_rgba(30,10,70,0.25)]"
        >
          <span class="text-sm font-medium text-white"> {{ selectedCount }} selected </span>

          <button
            class="text-sm text-white/70 underline-offset-2 transition-colors hover:text-white hover:underline"
            @click="$emit('clear')"
          >
            Clear
          </button>

          <button
            class="flex items-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-[var(--ck-indigo)] transition-colors hover:bg-white/90"
            @click="$emit('download')"
          >
            <UIcon name="i-lucide-download" class="h-4 w-4" />
            Download Selected
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
