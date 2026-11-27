<script setup lang="ts">
const settingsStore = useSettingsStore();
const colorStore = useColorStore();
onMounted(() => {
  setTimezone(settingsStore.timezone);
  colorStore.updateProfitLossColor();
});
// Runs synchronously during setup, so the theme is applied before the first render.
watchEffect(() => {
  document.documentElement.classList.toggle('dark', settingsStore.isDarkTheme);
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
    <div id="app" class="flex flex-col h-dvh" :style="colorStore.cssVars">
      <NavBar />
      <BodyLayout class="grow overflow-auto" />
      <NavFooter />
    </div>
  </UApp>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* * {
  outline: 1px solid #f00 !important;
} */
</style>
