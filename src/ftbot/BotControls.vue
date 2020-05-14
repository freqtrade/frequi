<template>
  <div class="container-fluid">
    <div class="row">
      <button class="btn-primary" @click="startBot()">Start</button>
      <button class="btn-primary" @click="stopBot()">Stop</button>
      <button class="btn-primary" @click="stopBuy()">StopBuy</button>
      <button class="btn-primary" @click="reloadConfig()">Reload Config</button>
      <button v-if="botState.forcebuy_enabled" class="btn-primary" @click="initiate_forcebuy">
        Forcebuy
      </button>
      <ForceBuyForm :modalShow="forcebuy_show" @close="this.$bvModal.hide('forcebuy-modal')" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import ForceBuyForm from './ForceBuyForm.vue';

export default {
  name: 'BotControls',
  components: { ForceBuyForm },
  computed: {
    ...mapState('ftbot', ['botState']),
  },
  data() {
    return {
      forcebuy_show: false,
    };
  },
  methods: {
    ...mapActions('ftbot', ['startBot', 'stopBot', 'stopBuy', 'reloadConfig']),
    initiate_forcebuy() {
      console.log('Forcebuy started');
      this.$bvModal.show('forcebuy-modal');
    },
  },
};
</script>
