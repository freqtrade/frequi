<template>
  <header>
    <NavBar />
  </header>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavBar from './NavBar.vue';

@Component({
  components: { NavBar },
})
export default class Header extends Vue {}
</script>

<style scoped>
header {
  padding-bottom: 1em;
}
</style>
