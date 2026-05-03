<script setup lang="ts">
const settingsStore = useSettingsStore();
const colorStore = useColorStore();
onMounted(() => {
  setTimezone(settingsStore.timezone);
  colorStore.updateProfitLossColor();
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
  <div id="app" class="flex flex-col h-dvh min-w-0 bg-surface-950 text-surface-100" :style="colorStore.cssVars">
    <NavBar />
    <Toast />
    <BodyLayout class="grow overflow-auto" />
    <NavFooter />
  </div>
</template>

<style scoped>
#app {
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* * {
  outline: 1px solid #f00 !important;
} */
</style>
