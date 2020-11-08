<template>
  <div class="container-fluid">
    <div class="row">
      <button
        class="btn btn-primary btn-sm col-md-5 m-1"
        :disabled="!isTrading"
        @click="startBot()"
      >
        Start
      </button>
      <button class="btn btn-primary btn-sm col-md-5 m-1" :disabled="!isTrading" @click="stopBot()">
        Stop
      </button>
      <button class="btn btn-primary btn-sm col-md-5 m-1" :disabled="!isTrading" @click="stopBuy()">
        StopBuy
      </button>
      <button
        class="btn btn-primary btn-sm col-md-5 m-1"
        :disabled="!isTrading"
        @click="reloadConfig()"
      >
        Reload Config
      </button>
      <button
        v-if="botState.forcebuy_enabled"
        class="btn btn-primary btn-sm col-md-5 m-1"
        :disabled="!isTrading"
        @click="initiateForcebuy"
      >
        Forcebuy
      </button>
      <button
        v-if="botState.runmode === 'webserver'"
        :disabled="isTrading"
        class="btn-primary col-md-5 m-1"
        @click="startTrade()"
      >
        Start Trading
      </button>
      <ForceBuyForm :modal-show="forcebuyShow" @close="this.$bvModal.hide('forcebuy-modal')" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BotState, RunModes } from '@/types';
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

  @ftbot.Action startTrade;

  get isTrading(): boolean {
    return this.botState.runmode === RunModes.LIVE || this.botState.runmode === RunModes.DRY_RUN;
  }

  initiateForcebuy() {
    this.$bvModal.show('forcebuy-modal');
  }
}
</script>
