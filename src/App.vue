<template>
  <div id="app" class="d-flex flex-column vh-100" :style="colorStore.cssVars">
    <NavBar />
    <BToaster></BToaster>
    <BodyLayout class="flex-fill overflow-auto" />
    <NavFooter />
  </div>
</template>

<script setup lang="ts">
import { setTimezone } from './shared/formatters';
import { onMounted, watch } from 'vue';
import { useSettingsStore } from './stores/settings';
import { useColorStore } from './stores/colors';
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

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

/* * {
  outline: 1px solid #f00 !important;
} */
</style>
