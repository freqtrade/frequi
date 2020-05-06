<template>
  <div class="container-fluid">
    <div class="row">
      <button class="btn-primary" @click="startBot()">Start</button>
      <button class="btn-primary" @click="stopBot()">Stop</button>
      <button class="btn-primary" @click="stopBuy()">StopBuy</button>
      <button class="btn-primary" @click="reloadConfig()">Reload Config</button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'BotControls',
  methods: {
    ...mapActions('ftbot', ['startBot', 'stopBot', 'stopBuy', 'reloadConfig']),
  },
};
</script>
