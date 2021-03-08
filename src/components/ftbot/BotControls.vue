<template>
  <div class="container-fluid">
    <div class="row">
      <button
        class="btn btn-secondary btn-sm ml-1"
        :disabled="!isTrading || isRunning"
        title="Start Trading"
        @click="startBot()"
      >
        <PlayIcon />
      </button>
      <button
        class="btn btn-secondary btn-sm ml-1"
        :disabled="!isTrading || !isRunning"
        title="Stop Trading - Also stops handling open trades."
        @click="stopBot()"
      >
        <StopIcon />
      </button>
      <button
        class="btn btn-secondary btn-sm ml-1"
        :disabled="!isTrading || !isRunning"
        title="StopBuy - Stops buying, but still handles open trades"
        @click="stopBuy()"
      >
        <PauseIcon />
      </button>
      <button
        class="btn btn-secondary btn-sm ml-1"
        :disabled="!isTrading"
        title="Reload Config - reloads configuration including strategy, resetting all settings changed on the fly."
        @click="reloadConfig()"
      >
        <ReloadIcon />
      </button>
      <button
        v-if="botState && botState.forcebuy_enabled"
        class="btn btn-secondary btn-sm ml-1"
        :disabled="!isTrading || !isRunning"
        title="Force Buy - Immediately buy an asset at an optional price. Sells are then handled according to strategy rules."
        @click="initiateForcebuy"
      >
        <ForceBuyIcon />
      </button>
      <button
        v-if="isWebserverMode"
        :disabled="isTrading"
        class="btn btn-secondary btn-sm ml-1"
        title="Start Trading mode"
        @click="startTrade()"
      >
        <PlayIcon />
      </button>
      <ForceBuyForm :modal-show="forcebuyShow" @close="$bvModal.hide('forcebuy-modal')" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BotState } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';
import PlayIcon from 'vue-material-design-icons/Play.vue';
import StopIcon from 'vue-material-design-icons/Stop.vue';
import PauseIcon from 'vue-material-design-icons/Pause.vue';
import ReloadIcon from 'vue-material-design-icons/Reload.vue';
import ForceBuyIcon from 'vue-material-design-icons/PlusBoxMultipleOutline.vue';
import ForceBuyForm from './ForceBuyForm.vue';

const ftbot = namespace('ftbot');

@Component({
  components: { ForceBuyForm, PlayIcon, StopIcon, PauseIcon, ReloadIcon, ForceBuyIcon },
})
export default class BotControls extends Vue {
  forcebuyShow = false;

  @ftbot.State botState?: BotState;

  @ftbot.Action startBot;

  @ftbot.Action stopBot;

  @ftbot.Action stopBuy;

  @ftbot.Action reloadConfig;

  @ftbot.Action startTrade;

  @ftbot.Getter [BotStoreGetters.isTrading]!: boolean;

  @ftbot.Getter [BotStoreGetters.isWebserverMode]!: boolean;

  get isRunning(): boolean {
    return this.botState?.state === 'running';
  }

  initiateForcebuy() {
    this.$bvModal.show('forcebuy-modal');
  }
}
</script>
