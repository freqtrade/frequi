<template>
  <div class="container-fluid">
    <div class="row">
      <button class="btn-primary" @click="startBot()">Start</button>
      <button class="btn-primary" @click="stopBot()">Stop</button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'BotControls',
  methods: {
    ...mapActions('ftbot', ['stopBot', 'startBot']),
  },
};
</script>
