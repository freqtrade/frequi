<template>
  <header>
    <NavBar />
  </header>
</template>

<script>
import NavBar from './NavBar.vue';

export default {
  name: 'Header',
  components: { NavBar },
};
</script>

<style scoped>
header {
  padding-bottom: 1em;
}
</style>
