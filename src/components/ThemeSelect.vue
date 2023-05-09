<template>
  <b-link variant="outline-primary" class="nav-link" @click="toggleNight">
    <i-mdi-brightness-6 />
  </b-link>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { onMounted, ref } from 'vue';

const activeTheme = ref('');
const settingsStore = useSettingsStore();

const setTheme = (themeName) => {
  // If theme is already active, do nothing.
  if (activeTheme.value === themeName) {
    return;
  }
  if (themeName.toLowerCase() === 'bootstrap' || themeName.toLowerCase() === 'bootstrap_dark') {
    // const styles = document.getElementsByTagName('style');
    document.documentElement.setAttribute(
      'data-theme',
      themeName.toLowerCase() === 'bootstrap' ? 'light' : 'dark',
    );
    if (activeTheme.value) {
      // Only transition if simple mode is active
      document.documentElement.classList.add('ft-theme-transition');
      window.setTimeout(() => {
        document.documentElement.classList.remove('ft-theme-transition');
      }, 1000);
    }
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
