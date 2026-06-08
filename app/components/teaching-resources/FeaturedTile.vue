<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle: string;
  url: string | null;
}>();

const isExternal = computed(() => !!props.url && /^https?:\/\//.test(props.url));

const tileClass =
  'group relative flex h-[180px] flex-col justify-end overflow-hidden rounded-[14px] bg-[var(--ck-primary)] p-5 text-white no-underline transition-all';
const interactiveClass =
  'cursor-pointer hover:bg-[var(--ck-primary-mid)] hover:shadow-[0_4px_18px_rgba(91,58,191,0.25)]';
</script>

<template>
  <a
    v-if="url && isExternal"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :class="[tileClass, interactiveClass]"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-30"
      style="
        background:
          radial-gradient(ellipse 60% 50% at 20% 20%, rgba(255, 255, 255, 0.15), transparent),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0, 201, 201, 0.1), transparent);
      "
    />
    <div class="relative text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70 mb-1">
      {{ subtitle }}
    </div>
    <div class="font-display relative text-[15px] font-semibold leading-[1.3]">
      {{ title }}
    </div>
  </a>
  <NuxtLink v-else-if="url" :to="url" :class="[tileClass, interactiveClass]">
    <div
      class="pointer-events-none absolute inset-0 opacity-30"
      style="
        background:
          radial-gradient(ellipse 60% 50% at 20% 20%, rgba(255, 255, 255, 0.15), transparent),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0, 201, 201, 0.1), transparent);
      "
    />
    <div class="relative text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70 mb-1">
      {{ subtitle }}
    </div>
    <div class="font-display relative text-[15px] font-semibold leading-[1.3]">
      {{ title }}
    </div>
  </NuxtLink>
  <div v-else :class="tileClass">
    <div
      class="pointer-events-none absolute inset-0 opacity-30"
      style="
        background:
          radial-gradient(ellipse 60% 50% at 20% 20%, rgba(255, 255, 255, 0.15), transparent),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(0, 201, 201, 0.1), transparent);
      "
    />
    <div class="relative text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70 mb-1">
      {{ subtitle }}
    </div>
    <div class="font-display relative text-[15px] font-semibold leading-[1.3]">
      {{ title }}
    </div>
  </div>
</template>
