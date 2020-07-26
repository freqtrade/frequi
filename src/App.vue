<template>
  <Container>
    <Header />
    <Body />
  </Container>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';
import Container from '@/components/layout/Container.vue';
import Header from '@/components/layout/Header.vue';
import Body from '@/components/layout/Body.vue';

@Component({
  components: { Container, Header, Body },
})
export default class App extends Vue {}
</script>

<style scoped></style>
