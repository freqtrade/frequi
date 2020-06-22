<template>
  <div class="home">
    <img alt="Freqtrade logo" src="../assets/freqtrade-logo.png" />
    <div>
      <h1>Welcome to the Freqtrade UI</h1>
    </div>
    <div>This page allows you to control your trading bot.</div>
    <br />
    <p>
      If you need any help, please refer to the
      <a href="https://www.freqtrade.io/en/latest/">Freqtrade Documentation</a>.
    </p>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Home extends Vue {}
</script>

<style scoped>
.home {
  margin-top: 1.5em;
}
</style>
