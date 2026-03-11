<script setup lang="ts">
import type { ThemeName } from '@/types';

const activeTheme = ref('');
const settingsStore = useSettingsStore();

withDefaults(defineProps<{ showText?: boolean }>(), { showText: false });

function setTheme(themeName: ThemeName) {
  // If theme is already active, do nothing.
  if (activeTheme.value === themeName) {
    return;
  }
  if (['bootstrap', 'bootstrap_dark', 'light', 'dark'].includes(themeName.toLowerCase())) {
    // const styles = document.getElementsByTagName('style');
    if (activeTheme.value) {
      // Only transition if simple mode is active
      document.body.classList.add('ft-theme-transition');
      window.setTimeout(() => {
        document.body.classList.remove('ft-theme-transition');
      }, 1000);
    }
    if (themeName.toLowerCase() === 'bootstrap' || themeName.toLowerCase() === 'light') {
      document.documentElement.classList.remove('dark', 'ft-dark-theme');
    } else {
      // Add the dark theme
      document.documentElement.classList.add('dark', 'ft-dark-theme');
    }
  }
  // Save the theme as localstorage
  settingsStore.currentTheme = themeName;
  activeTheme.value = themeName;
}

onMounted(() => {
  if (settingsStore.currentTheme) setTheme(settingsStore.currentTheme);
});

function toggleNight() {
  setTheme(['light', 'bootstrap'].includes(activeTheme.value) ? 'dark' : 'light');
}
</script>

<template>
  <Button
    variant="text"
    title="Toggle Night Mode"
    class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium !outline-none !ring-0 !border-none hover:bg-transparent focus:ring-0"
    :label="showText ? 'Toggle Night Mode' : ''"
    @click="toggleNight"
  >
    <template #icon>
      <i-mdi-brightness-6 class="text-xl" />
    </template>
  </Button>
</template>
