<template>
  <div>
    <b-nav-item-dropdown
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
        @click="handleClick"
        :active="activeTheme === theme.name"
        v-b-tooltip.hover.right
        :title="theme.description"
        >{{ theme.name }}</b-dropdown-item-button
      >
    </b-nav-item-dropdown>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeTheme: '',
      themes: [
        {
          name: 'Cerulean',
          description: 'A calm blue sky',
        },
        {
          name: 'Cosmo',
          description: 'An ode to Metro',
        },
        {
          name: 'Cyborg',
          description: 'Jet black and electric blue',
        },
        {
          name: 'Darkly',
          description: 'Flatly in night mode',
        },
        {
          name: 'Flatly',
          description: 'Flat and modern',
        },
        {
          name: 'Journal',
          description: 'Crisp like a new sheet of paper',
        },
        {
          name: 'Litera',
          description: 'The medium is the message',
        },
        {
          name: 'Lumen',
          description: 'Light and shadow',
        },
        {
          name: 'Lux',
          description: 'A touch of class',
        },
        {
          name: 'Materia',
          description: 'Material is the metaphor',
        },
        {
          name: 'Minty',
          description: 'A fresh feel',
        },
        {
          name: 'Pulse',
          description: 'A trace of purple',
        },
        {
          name: 'Sandstone',
          description: 'A touch of warmth',
        },
        {
          name: 'Simplex',
          description: 'Mini and minimalist',
        },
        {
          name: 'Sketchy',
          description: 'A hand-drawn look for mockups and mirth',
        },
        {
          name: 'Slate',
          description: 'Shades of gunmetal gray',
        },
        {
          name: 'Solar',
          description: 'A spin on Solarized',
        },
        {
          name: 'Spacelab',
          description: 'Silvery and sleek',
        },
        {
          name: 'Superhero',
          description: 'The brave and the blue',
        },
        {
          name: 'United',
          description: 'Ubuntu orange and unique font',
        },
        {
          name: 'Yeti',
          description: 'A friendly foundation',
        },
      ],
    };
  },
  name: 'BootswatchThemeSelect',
  mounted() {
    // If a theme has been stored in localstorage, the theme will be set.
    if (window.localStorage.theme) this.setTheme(window.localStorage.theme);
  },
  methods: {
    handleClick(e) {
      this.setTheme(e.target.innerText.trim());
    },
    setTheme(themeName) {
      // If theme is already active, do nothing.
      if (this.activeTheme === themeName) {
        return;
      }

      // Dynamic import for a different theme, to avoid loading ALL themes.
      import(`bootswatch/dist/${themeName.toLowerCase()}/bootstrap.min.css`).then(() => {
        const styles = document.getElementsByTagName('style');
        const bw = Array.from(styles).filter((w) => w.textContent.includes('bootswatch'));
        bw.forEach((style, index) => {
          if (!style.id) {
            // If its a style that was just imported and hasn't been assigned an id.
            bw[index].id = themeName;
          } else if (style.id === themeName) {
            // If it's a style that has been imported already.
            bw[index].disabled = false;
          } else {
            // All other style themes should be disabled.
            bw[index].disabled = true;
          }
        });
      });
      // Save the theme as localstorage
      console.log('Setting theme as', themeName);
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
          console.log(error);
        });
    },
  },
};
</script>

<style scoped>
</style>
