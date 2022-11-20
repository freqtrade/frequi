<template>
  <div class="home">
    <div class="d-flex justify-content-center">
      <bot-list />
    </div>
    <hr />
    <!-- <img alt="Freqtrade logo" src="../assets/freqtrade-logo.png" width="450px" class="my-5" /> -->
    <div title="Freqtrade logo" class="logo-svg my-5 mx-auto" />
    <div>
      <h1>Welcome to the Freqtrade UI</h1>
    </div>
    <div>This page allows you to control your trading bot.</div>
    <br />
    <p>
      If you need any help, please refer to the
      <a href="https://www.freqtrade.io/en/latest/">Freqtrade Documentation</a>.
    </p>

    <p>Have fun - <i>wishes you the Freqtrade team</i></p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import BotList from '@/components/BotList.vue';

export default defineComponent({
  name: 'Home',
  components: { BotList },
});
</script>

<style lang="scss" scoped>
.home {
  margin-top: 1.5em;
}
.logo-svg {
  -webkit-mask: url(../assets/freqtrade-logo-mask.png) no-repeat center;
  -webkit-mask-size: 240px 240px;
  mask: url(../assets/freqtrade-logo-mask.png) no-repeat center;
  mask-size: contain;
  width: 250px;
  height: 250px;
}
</style>
