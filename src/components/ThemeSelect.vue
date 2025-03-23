<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';

const activeTheme = ref('');
const settingsStore = useSettingsStore();

withDefaults(defineProps<{ showText?: boolean }>(), { showText: false });

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
    const element = document.querySelector('html');
    if (element) {
      if (themeName.toLowerCase() === 'bootstrap') {
        element.classList.remove('dark', 'ft-dark-theme');
      } else {
        // Add the dark theme
        element.classList.add('dark', 'ft-dark-theme');
      }
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

<template>
  <Button
    variant="link"
    title="Toggle Night Mode"
    class="text-surface-200"
    :label="showText ? 'Toggle Night Mode' : ''"
    @click="toggleNight"
  >
    <template #icon>
      <i-mdi-brightness-6 />
    </template>
  </Button>
</template>
