<script setup lang="ts"></script>

<template>
  <div class="mt-5">
    <div class="flex justify-center">
      <BotList />
    </div>
    <Divider />
    <!-- <img alt="Freqtrade logo" src="../assets/freqtrade-logo.png" width="450px" class="my-5" /> -->
    <div title="Freqtrade logo" class="logo-svg my-5 mx-auto dark:bg-white bg-black" />
    <h1 class="font-bold text-4xl mb-4">Welcome to the Freqtrade UI</h1>
    <div>This page allows you to control your trading bot.</div>
    <Divider />
    <p class="mb-2">
      If you need any help, please refer to the
      <a
        class="text-primary underline cursor-pointer"
        href="https://www.freqtrade.io/en/latest/"
        target="_blank"
        >Freqtrade Documentation</a
      >.
    </p>

    <p>Have fun - <i>wishes you the Freqtrade team</i></p>
  </div>
</template>

<style lang="css" scoped>
.logo-svg {
  -webkit-mask: url(../assets/freqtrade-logo-mask.png) no-repeat center;
  -webkit-mask-size: 240px 240px;
  mask: url(../assets/freqtrade-logo-mask.png) no-repeat center;
  mask-size: contain;
  width: 250px;
  height: 250px;
}
</style>
