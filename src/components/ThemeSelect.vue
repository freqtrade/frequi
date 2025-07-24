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
