<template>
  <div id="app" class="d-flex flex-column vh-100">
    <NavBar />
    <BodyLayout class="flex-fill overflow-auto" />
    <NavFooter />
  </div>
</template>

<script lang="ts">
import NavBar from '@/components/layout/NavBar.vue';
import NavFooter from '@/components/layout/NavFooter.vue';
import BodyLayout from '@/components/layout/BodyLayout.vue';
import { setTimezone } from './shared/formatters';
import { defineComponent, onMounted, watch } from 'vue';
import { useSettingsStore } from './stores/settings';
export default defineComponent({
  name: 'App',
  components: { NavBar, BodyLayout, NavFooter },
  setup() {
    const settingsStore = useSettingsStore();
    onMounted(() => {
      setTimezone(settingsStore.timezone);
    });
    watch(
      () => settingsStore.timezone,
      (tz) => {
        console.log('timezone changed', tz);
        setTimezone(tz);
      },
    );
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
