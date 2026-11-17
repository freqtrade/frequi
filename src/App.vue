<script setup lang="ts">
const settingsStore = useSettingsStore();
const colorStore = useColorStore();
onMounted(() => {
  setTimezone(settingsStore.timezone);
  colorStore.updateProfitLossColor();
});
// Apply the selected accent preset (see html[data-accent] in tailwind.css)
watchEffect(() => {
  document.documentElement.dataset.accent = settingsStore.accent;
  document.documentElement.dataset.density = settingsStore.density;
});
watch(
  () => settingsStore.timezone,
  (tz) => {
    console.log('timezone changed', tz);
    setTimezone(tz);
  },
);
</script>

<template>
  <UApp>
    <div id="app" class="flex h-dvh" :style="colorStore.cssVars">
      <SideNav />
      <div class="flex min-w-0 grow flex-col">
        <NavBar />
        <BodyLayout class="grow overflow-auto" />
        <NavFooter />
      </div>
    </div>
  </UApp>
</template>

<style scoped>
#app {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* * {
  outline: 1px solid #f00 !important;
} */
</style>
