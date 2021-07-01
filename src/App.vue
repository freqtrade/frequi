<template>
  <div id="app" class="d-flex flex-column vh-100">
    <Header />
    <Body class="flex-fill overflow-auto" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Header from '@/components/layout/Header.vue';
import Body from '@/components/layout/Body.vue';
import { namespace } from 'vuex-class';
import { SettingsGetters } from './store/modules/settings';
import { setTimezone } from './shared/formatters';

const uiSettingsNs = namespace('uiSettings');

@Component({
  components: { Header, Body },
})
export default class App extends Vue {
  @uiSettingsNs.Getter [SettingsGetters.timezone]: string;

  mounted() {
    setTimezone(this.timezone);
  }
}
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
