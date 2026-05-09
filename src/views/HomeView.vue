<template>
  <div class="mt-5">
    <div class="flex justify-center">
      <BotList class="max-w-xl" />
    </div>
    <USeparator class="my-5" />
    <AppIcon class="my-5 sm:w-80 sm:h-80 w-64 h-64" />

    <h1 class="font-bold text-2xl sm:text-4xl mb-4 transition-all">Welcome to the Freqtrade UI</h1>
    <div>This page allows you to control your trading bot.</div>
    <USeparator class="my-5" />
    <p class="mb-2">
      If you need any help, please refer to the
      <a
        class="text-primary underline cursor-pointer"
        href="https://www.freqtrade.io/en/latest/"
        target="_blank"
      >
        Freqtrade Documentation
      </a>
      .
    </p>

    <p class="mb-5">Have fun - <i>wishes you the Freqtrade team</i></p>
  </div>
</template>
