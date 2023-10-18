<template>
  <div id="app" class="d-flex flex-column vh-100">
    <NavBar />
    <BToaster></BToaster>
    <BodyLayout class="flex-fill overflow-auto" />
    <NavFooter />
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue';
import NavFooter from '@/components/layout/NavFooter.vue';
import BodyLayout from '@/components/layout/BodyLayout.vue';
import { setTimezone } from './shared/formatters';
import { setProfitLossColorsCSS } from './shared/colorPreference';
import { onMounted, watch } from 'vue';
import { useSettingsStore } from './stores/settings';
import { useColorStore } from './stores/colors';
const settingsStore = useSettingsStore();
const colorStore = useColorStore();
onMounted(() => {
  setTimezone(settingsStore.timezone);
  setProfitLossColorsCSS(colorStore.colorPreference);
  colorStore.updateProfitLossColor();
});
watch(
  () => settingsStore.timezone,
  (tz) => {
    console.log('timezone changed', tz);
    setTimezone(tz);
  },
);
watch(
  () => colorStore.colorPreference,
  (preference) => {
    setProfitLossColorsCSS(preference);
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
