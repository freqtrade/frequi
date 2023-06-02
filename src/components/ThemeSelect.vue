<template>
  <b-link class="nav-link" @click="toggleNight">
    <i-mdi-brightness-6 />
  </b-link>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { useColorMode } from 'bootstrap-vue-next';
import { onMounted, ref } from 'vue';

const mode = useColorMode();

const activeTheme = ref('');
const settingsStore = useSettingsStore();

const setTheme = (themeName: string) => {
  // If theme is already active, do nothing.
  if (activeTheme.value === themeName) {
    return;
  }
  if (themeName.toLowerCase() === 'bootstrap' || themeName.toLowerCase() === 'bootstrap_dark') {
    // const styles = document.getElementsByTagName('style');
    if (activeTheme.value) {
      // Only transition if simple mode is active
      document.body.classList.add('ft-theme-transition');
      window.setTimeout(() => {
        document.body.classList.remove('ft-theme-transition');
      }, 1000);
    }
    mode.value = themeName.toLowerCase() === 'bootstrap' ? 'light' : 'dark';
  }
  // Save the theme as localstorage
  settingsStore.currentTheme = themeName;
  activeTheme.value = themeName;
};

onMounted(() => {
  if (settingsStore.currentTheme) setTheme(settingsStore.currentTheme);
});

const toggleNight = () => {
  setTheme(activeTheme.value === 'bootstrap' ? 'bootstrap_dark' : 'bootstrap');
};
</script>

<style scoped></style>
