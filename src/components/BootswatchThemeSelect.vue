<template>
  <div>
    <!-- <img :src="theme.thumbnail" style="height: 30px;" /> -->
    <b-nav-item-dropdown
      id="my-nav-dropdown"
      text="Theme"
      toggle-class="nav-link-custom"
      @show.once="fetchApi"
      right
      lazy
    >
      <b-dropdown-item v-if="themes.length === 0">
        <b-spinner small></b-spinner>
        Loading Themes...
      </b-dropdown-item>

      <!-- TODO Add  v-b-tooltip.hover.right=="{ variant: 'info' }" for tooltip class rendered from bootswatch-->
      <b-dropdown-item-button
        v-for="(theme, key) in themes"
        :key="key"
        @click="handleClick"
        :value="theme.cssCdn"
        :active="activeTheme === theme.name"
        v-b-tooltip.hover.right
        :title="theme.description"
        >{{ theme.name }}
      </b-dropdown-item-button>
    </b-nav-item-dropdown>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeTheme: '',
      themes: [],
      supportsLocalStorage: false,
    };
  },
  name: 'BootswatchThemeSelect',
  created() {
    // this.fetchApi();
    // We don't need to call the api here because it will be called once the show event is triggered from clicking on the dropdown.
  },
  mounted() {
    this.supportsLocalStorage = window.localStorage.length > 0;
    this.getTheme();
  },
  updated() {},
  methods: {
    handleClick(e) {
      this.setTheme(e.target.innerText.trim());
    },
    setTheme(themeName) {
      // Change the stylesheet to a different theme
      if (this.activeTheme === themeName) {
        return;
      }

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
      if (this.supportsLocalStorage) {
        console.log('Setting new theme as ', themeName);
        window.localStorage.theme = themeName;
      }
      this.activeTheme = themeName;
    },
    getTheme() {
      // console.log('Looking in local storage for theme.');
      if (this.supportsLocalStorage) {
        const themeName = window.localStorage.theme;
        if (themeName) {
          console.log(`${themeName} theme found in localstorage`);
          this.setTheme(themeName);
        }
      }
    },
    fetchApi() {
      // Fetches boostswatch api and dynamically sets themes.
      // console.log('Calling bootswatch api');

      axios
        .get('https://bootswatch.com/api/4.json')
        .then((res) => {
          const { themes } = res.data;
          this.themes = themes;
          // console.log(themes);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style scoped></style>
