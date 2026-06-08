<script setup lang="ts">
defineProps<{
  to: string;
  label: string;
  activePath: string;
}>();

const route = useRoute();
function isActive(path: string): boolean {
  return route.path.startsWith(path);
}
</script>

<template>
  <NuxtLink
    :to="to"
    class="no-underline text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 ease-in-out"
    :class="
      isActive(activePath)
        ? 'text-white bg-white/[0.13] font-semibold'
        : 'text-white/80 hover:text-white/90 hover:bg-white/8'
    "
  >
    {{ label }}
  </NuxtLink>
</template>
