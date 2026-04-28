<template>
  <div class="flex justify-between gap-4">
    <dt class="text-muted">{{ label }}</dt>
    <dd class="text-right">{{ value }}</dd>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string }>()
</script>
