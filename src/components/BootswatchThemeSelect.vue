<template>
  <div>
    <!-- <img :src="theme.thumbnail" style="height: 30px;" /> -->
    <b-nav-item-dropdown
      id="my-nav-dropdown"
      text="Theme"
      toggle-class="nav-link-custom"
      right
      lazy
    >
      <b-dropdown-item-button
        v-for="(theme, key) in themes"
        :key="key"
        @click="handleClick"
        :value="theme.cssCdn"
        :active="activeTheme === theme.cssCdn"
        :disabled="activeTheme === theme.cssCdn"
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
    console.log('Calling bootswatch api');
    this.fetchApi();
  },
  mounted() {
    this.supportsLocalStorage = window.localStorage.length > 0;
  },
  updated() {
    if (this.supportsLocalStorage) {
      const { theme } = window.localStorage;
      console.log('theme', window.localStorage.theme);
      if (theme) {
        console.log('Theme found in localstorage', theme);
        this.setTheme(theme);
      }
    }
  },
  methods: {
    handleClick(e) {
      this.setTheme(e.target.value);
    },
    setTheme(theme) {
      // Change the stylesheet to a different cdn
      if (this.activeTheme === theme) {
        return;
      }
      const stylesheet = document.querySelector(
        'link[rel="stylesheet"][href$="/bootstrap.min.css"]',
      );
      if (stylesheet) {
        stylesheet.href = theme;
      } else {
        const link = document.createElement('link');
        link.href = theme;
        link.rel = 'stylesheet';
        link.title = 'bootswatch-theme';
        document.body.append(link);
      }

      // Save the theme as localstorage
      if (this.supportsLocalStorage) {
        console.log('Setting new theme as ', theme);
        window.localStorage.theme = theme;
      }
      this.activeTheme = theme;
    },
    fetchApi() {
      axios
        .get('https://bootswatch.com/api/4.json')
        .then((res) => {
          const { themes } = res.data;
          this.themes = themes;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style></style>
