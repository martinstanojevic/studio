<script setup lang="ts"></script>

<template>
  <div>
    <header
      class="sticky top-0 z-50 flex items-center justify-between px-6 h-[52px] bg-[var(--ck-indigo)]"
    >
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 no-underline text-white">
        <img src="/ck-logo-white.png" alt="CourseKata" class="h-[28px] w-auto" />
        <span class="text-[12px] leading-[12px] font-medium"
          >Teaching <br />
          Resources</span
        >
      </NuxtLink>

      <!-- Nav Links -->
      <nav class="flex items-center gap-0.5">
        <AppHeaderLink to="/resources" label="Resources" active-path="/resources" />
        <AppHeaderLink to="/datasets" label="Datasets" active-path="/datasets" />
        <AppHeaderLink to="/faq" label="FAQ" active-path="/faq" />
      </nav>

      <!-- Right side spacer for symmetry -->
      <div class="w-[120px]" />
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
