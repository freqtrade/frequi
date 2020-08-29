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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BotState } from '@/types';
import ForceBuyForm from './ForceBuyForm.vue';

const ftbot = namespace('ftbot');

@Component({ components: { ForceBuyForm } })
export default class BotControls extends Vue {
  forcebuyShow = false;

  @ftbot.State botState!: BotState;

  @ftbot.Action startBot;

  @ftbot.Action stopBot;

  @ftbot.Action stopBuy;

  @ftbot.Action reloadConfig;

  initiateForcebuy() {
    this.$bvModal.show('forcebuy-modal');
  }
}
</script>
