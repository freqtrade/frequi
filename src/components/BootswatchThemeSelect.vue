<template>
  <div>
    <b-nav-item-dropdown
      v-if="!simple"
      id="my-nav-dropdown"
      text="Theme"
      toggle-class="nav-link-custom"
      right
      lazy
    >
      <b-dropdown-item v-if="themeList1.length === 0">
        <b-spinner small></b-spinner> Loading Themes...
      </b-dropdown-item>

      <!-- TODO Add  v-b-tooltip.hover.right=="{ variant: 'className' }" for tooltip class rendered from bootswatch-->
      <b-dropdown-item-button
        v-for="(theme, key) in themeList1"
        :key="key"
        :active="activeTheme === theme.name"
        :title="theme.description"
        :name="theme.name"
        @click="handleClick"
        >{{ theme.name }}{{ theme.dark ? ' [dark]' : '' }}</b-dropdown-item-button
      >
    </b-nav-item-dropdown>
    <b-link v-else variant="outline-primary" class="nav-link" @click="toggleNight">
      <ThemeLightDark :size="16" />
    </b-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ThemeLightDark from 'vue-material-design-icons/Brightness6.vue';
import { FTHTMLStyleElement } from '@/types/styleElement';
import { useSettingsStore } from '@/stores/settings';
import { themeList, ThemeType } from '@/shared/themes';

const props = defineProps({
  simple: {
    type: Boolean,
    default: true,
  },
});
const activeTheme = ref('');
const themeList1 = ref<ThemeType[]>(themeList);
const settingsStore = useSettingsStore();

const setTheme = (themeName) => {
  // If theme is already active, do nothing.
  if (activeTheme.value === themeName) {
    return;
  }
  if (themeName.toLowerCase() === 'bootstrap' || themeName.toLowerCase() === 'bootstrap_dark') {
    const styles = document.getElementsByTagName('style');
    const bw = Array.from(styles).filter((w) => w.textContent?.includes('bootswatch'));
    document.documentElement.setAttribute(
      'data-theme',
      themeName.toLowerCase() === 'bootstrap' ? 'light' : 'dark',
    );
    // Reset all bootswatch styles
    bw.forEach((style, index) => {
      (bw[index] as FTHTMLStyleElement).disabled = true;
    });
    if (props.simple && activeTheme.value) {
      // Only transition if simple mode is active
      document.documentElement.classList.add('ft-theme-transition');
      window.setTimeout(() => {
        document.documentElement.classList.remove('ft-theme-transition');
      }, 1000);
    }
  } else {
    // Dynamic import for a different theme, to avoid loading ALL themes.
    import(`bootswatch/dist/${themeName.toLowerCase()}/bootstrap.min.css`).then((mod) => {
      console.log('theme', mod);
      document.documentElement.removeAttribute('data-theme');
      const styles = document.getElementsByTagName('style');
      const bw = Array.from(styles).filter((w) => w.textContent?.includes('bootswatch'));
      bw.forEach((style, index) => {
        if (!style.id) {
          // If its a style that was just imported and hasn't been assigned an id.
          bw[index].id = themeName;
        } else if (style.id === themeName) {
          // If it's a style that has been imported already.
          (bw[index] as FTHTMLStyleElement).disabled = false;
        } else {
          // All other style themes should be disabled.
          (bw[index] as FTHTMLStyleElement).disabled = true;
        }
      });
    });
  }
  // Save the theme as localstorage
  settingsStore.currentTheme = themeName;
  activeTheme.value = themeName;
};

onMounted(() => {
  if (settingsStore.currentTheme) setTheme(settingsStore.currentTheme);
});

const handleClick = (e) => {
  setTheme(e.target.name.trim());
};
const toggleNight = () => {
  setTheme(activeTheme.value === 'bootstrap' ? 'bootstrap_dark' : 'bootstrap');
};
const fetchApi = () => {
  // Fetches boostswatch api and dynamically sets themes.
  // Not used, but useful for updating the static array of themes if bootswatch dependency is outdated.
  axios
    .get('https://bootswatch.com/api/4.json')
    // .then((res) => {

    // const { themes } = res.data;
    // this.themes = themes;
    // Use this code in the browser console and copy and paste the filteredThemes into this.themes
    // console.log(themes);
    // const filteredThemes = [];
    // themes.forEach((item) =>
    //   filteredThemes.push({ name: item.name, description: item.description }),
    // );
    // })
    .catch((error) => {
      console.error(error);
    });
};
</script>

<style scoped></style>
