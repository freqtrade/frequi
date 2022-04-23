<template>
  <div id="app" class="d-flex flex-column vh-100">
    <NavBar />
    <Body class="flex-fill overflow-auto" />
    <NavFooter />
  </div>
</template>

<script lang="ts">
import NavBar from '@/components/layout/NavBar.vue';
import NavFooter from '@/components/layout/NavFooter.vue';
import Body from '@/components/layout/Body.vue';
import { setTimezone } from './shared/formatters';
import { defineComponent, onMounted } from '@vue/composition-api';
import { useSettingsStore } from './stores/settings';

export default defineComponent({
  name: 'App',
  components: { NavBar, Body, NavFooter },
  setup() {
    const settingsStore = useSettingsStore();
    onMounted(() => {
      setTimezone(settingsStore.timezone);
    });
    return {};
  },
});
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

/* * {
  outline: 1px solid #f00 !important;
} */
</style>
