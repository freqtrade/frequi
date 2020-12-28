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
      <b-dropdown-item v-if="themes.length === 0">
        <b-spinner small></b-spinner> Loading Themes...
      </b-dropdown-item>

      <!-- TODO Add  v-b-tooltip.hover.right=="{ variant: 'className' }" for tooltip class rendered from bootswatch-->
      <b-dropdown-item-button
        v-for="(theme, key) in themes"
        :key="key"
        v-b-tooltip.hover.right
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

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import ThemeLightDark from 'vue-material-design-icons/Brightness6.vue';

export default Vue.extend({
  name: 'BootswatchThemeSelect',
  components: { ThemeLightDark },
  props: {
    simple: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      activeTheme: '',
      themes: [
        {
          name: 'Bootstrap',
          description: 'Plain bootstrap default theme',
          dark: false,
        },
        {
          name: 'Bootstrap_dark',
          description: 'Plain dark bootstrap default theme',
          dark: true,
        },
        {
          name: 'Cerulean',
          description: 'A calm blue sky',
          dark: false,
        },
        {
          name: 'Cosmo',
          description: 'An ode to Metro',
          dark: false,
        },
        {
          name: 'Cyborg',
          description: 'Jet black and electric blue',
          dark: true,
        },
        {
          name: 'Darkly',
          description: 'Flatly in night mode',
          dark: true,
        },
        {
          name: 'Flatly',
          description: 'Flat and modern',
          dark: false,
        },
        {
          name: 'Journal',
          description: 'Crisp like a new sheet of paper',
          dark: false,
        },
        {
          name: 'Litera',
          description: 'The medium is the message',
          dark: false,
        },
        {
          name: 'Lumen',
          description: 'Light and shadow',
          dark: false,
        },
        {
          name: 'Lux',
          description: 'A touch of class',
          dark: false,
        },
        {
          name: 'Materia',
          description: 'Material is the metaphor',
          dark: false,
        },
        {
          name: 'Minty',
          description: 'A fresh feel',
          dark: false,
        },
        {
          name: 'Pulse',
          description: 'A trace of purple',
          dark: false,
        },
        {
          name: 'Sandstone',
          description: 'A touch of warmth',
          dark: false,
        },
        {
          name: 'Simplex',
          description: 'Mini and minimalist',
          dark: false,
        },
        {
          name: 'Sketchy',
          description: 'A hand-drawn look for mockups and mirth',
          dark: false,
        },
        {
          name: 'Slate',
          description: 'Shades of gunmetal gray',
          dark: true,
        },
        {
          name: 'Solar',
          description: 'A spin on Solarized',
          dark: true,
        },
        {
          name: 'Spacelab',
          description: 'Silvery and sleek',
          dark: false,
        },
        {
          name: 'Superhero',
          description: 'The brave and the blue',
          dark: true,
        },
        {
          name: 'United',
          description: 'Ubuntu orange and unique font',
          dark: false,
        },
        {
          name: 'Yeti',
          description: 'A friendly foundation',
          dark: false,
        },
      ],
    };
  },
  mounted() {
    // If a theme has been stored in localstorage, the theme will be set.
    if (window.localStorage.theme) this.setTheme(window.localStorage.theme);
  },
  methods: {
    handleClick(e) {
      this.setTheme(e.target.name.trim());
    },
    toggleNight() {
      this.setTheme(this.activeTheme === 'bootstrap_dark' ? 'bootstrap' : 'bootstrap_dark');
    },
    setTheme(themeName) {
      // If theme is already active, do nothing.
      if (this.activeTheme === themeName) {
        return;
      }
      if (themeName.toLowerCase() === 'bootstrap' || themeName.toLowerCase() === 'bootstrap_dark') {
        const styles = document.getElementsByTagName('style');
        const bw = Array.from(styles).filter((w) => w.textContent?.includes('bootswatch'));
        document.documentElement.setAttribute(
          'data-theme',
          themeName.toLowerCase() === 'bootstrap_dark' ? 'dark' : 'light',
        );
        // Reset all bootswatch styles
        bw.forEach((style, index) => {
          (bw[index] as any).disabled = true;
        });
        document.documentElement.classList.add('ft-theme-transition');
        window.setTimeout(() => {
          document.documentElement.classList.remove('ft-theme-transition');
        }, 1000);
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
              (bw[index] as any).disabled = false;
            } else {
              // All other style themes should be disabled.
              (bw[index] as any).disabled = true;
            }
          });
        });
      }
      // Save the theme as localstorage
      window.localStorage.theme = themeName;
      this.activeTheme = themeName;
    },
    fetchApi() {
      // Fetches boostswatch api and dynamically sets themes.
      // Not used, but useful for updating the static array of themes if bootswatch dependency is outdated.
      axios
        .get('https://bootswatch.com/api/4.json')
        .then((res) => {
          const { themes } = res.data;
          this.themes = themes;

          // Use this code in the browser console and copy and paste the filteredThemes into this.themes
          // console.log(themes);
          // const filteredThemes = [];
          // themes.forEach((item) =>
          //   filteredThemes.push({ name: item.name, description: item.description }),
          // );
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
});
</script>

<style scoped></style>
