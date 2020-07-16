<template>
  <div class="container-fluid">
    <div class="row">
      <button class="btn-primary col-md-5 m-1" @click="startBot()">Start</button>
      <button class="btn-primary col-md-5 m-1" @click="stopBot()">Stop</button>
      <button class="btn-primary col-md-5 m-1" @click="stopBuy()">StopBuy</button>
      <button class="btn-primary col-md-5 m-1" @click="reloadConfig()">Reload Config</button>
      <button
        class="btn-primary col-md-5 m-1"
        v-if="botState.forcebuy_enabled"
        @click="initiateForcebuy"
      >
        Forcebuy
      </button>
      <ForceBuyForm :modalShow="forcebuyShow" @close="this.$bvModal.hide('forcebuy-modal')" />
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
      forcebuyShow: false,
    };
  },
  methods: {
    ...mapActions('ftbot', ['startBot', 'stopBot', 'stopBuy', 'reloadConfig']),
    initiateForcebuy() {
      console.log('Forcebuy started');
      this.$bvModal.show('forcebuy-modal');
    },
  },
};
</script>
