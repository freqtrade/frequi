<template>
  <Container>
    <Header />
    <Body />
  </Container>
</template>

<script>
import Container from '@/components/layout/Container.vue';
import Header from '@/components/layout/Header.vue';
import Body from '@/components/layout/Body.vue';

export default {
  components: { Container, Header, Body },
  mounted() {
    this.$store.dispatch('theme/initTheme');
  },
};
</script>

<style>
/* Global styles - populating to child elementes */
.card-header {
  font-size: 1.3em;
}
.card-body {
  overflow: auto;
}
</style>
