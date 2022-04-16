<template>
  <div>
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
      @click="handleStopBot()"
    >
      <StopIcon />
    </button>
    <button
      class="btn btn-secondary btn-sm ml-1"
      :disabled="!isTrading || !isRunning"
      title="StopBuy - Stops buying, but still handles open trades"
      @click="handleStopBuy()"
    >
      <PauseIcon />
    </button>
    <button
      class="btn btn-secondary btn-sm ml-1"
      :disabled="!isTrading"
      title="Reload Config - reloads configuration including strategy, resetting all settings changed on the fly."
      @click="handleReloadConfig()"
    >
      <ReloadIcon />
    </button>
    <button
      class="btn btn-secondary btn-sm ml-1"
      :disabled="!isTrading"
      title="Forcesell all"
      @click="handleForceSell()"
    >
      <ForceSellIcon />
    </button>
    <button
      v-if="botState && (botState.force_entry_enable || botState.forcebuy_enabled)"
      class="btn btn-secondary btn-sm ml-1"
      :disabled="!isTrading || !isRunning"
      title="Force enter - Immediately buy an asset at an optional price. Sells are then handled according to strategy rules."
      @click="initiateForceenter"
    >
      <ForceBuyIcon />
    </button>
    <button
      v-if="isWebserverMode && false"
      :disabled="isTrading"
      class="btn btn-secondary btn-sm ml-1"
      title="Start Trading mode"
      @click="startTrade()"
    >
      <PlayIcon />
    </button>
    <ForceBuyForm :modal-show="forcebuyShow" @close="$bvModal.hide('forcebuy-modal')" />
  </div>
</template>

<script lang="ts">
import { ForceSellPayload } from '@/types';
import { BotStoreActions, BotStoreGetters } from '@/store/modules/ftbot';
import PlayIcon from 'vue-material-design-icons/Play.vue';
import StopIcon from 'vue-material-design-icons/Stop.vue';
import PauseIcon from 'vue-material-design-icons/Pause.vue';
import ReloadIcon from 'vue-material-design-icons/Reload.vue';
import ForceSellIcon from 'vue-material-design-icons/CloseBoxMultiple.vue';
import ForceBuyIcon from 'vue-material-design-icons/PlusBoxMultipleOutline.vue';
import StoreModules from '@/store/storeSubModules';
import ForceBuyForm from './ForceBuyForm.vue';
import { defineComponent, computed, ref } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'BotControls',
  components: {
    ForceBuyForm,
    PlayIcon,
    StopIcon,
    PauseIcon,
    ReloadIcon,
    ForceSellIcon,
    ForceBuyIcon,
  },
  setup(_, { root }) {
    const forcebuyShow = ref(false);
    const { botState, isTrading, isWebserverMode } = useNamespacedGetters(StoreModules.ftbot, [
      BotStoreGetters.botState,
      BotStoreGetters.isTrading,
      BotStoreGetters.isWebserverMode,
    ]);
    const { startBot, stopBot, stopBuy, reloadConfig, startTrade, forcesell } =
      useNamespacedActions(StoreModules.ftbot, [
        BotStoreActions.startBot,
        BotStoreActions.stopBot,
        BotStoreActions.stopBuy,
        BotStoreActions.reloadConfig,
        BotStoreActions.startTrade,
        BotStoreActions.forcesell,
      ]);

    const isRunning = computed((): boolean => {
      return botState.value?.state === 'running';
    });

    const initiateForceenter = () => {
      root.$bvModal.show('forcebuy-modal');
    };

    const handleStopBot = () => {
      root.$bvModal.msgBoxConfirm('Stop Bot?').then((value: boolean) => {
        if (value) {
          stopBot();
        }
      });
    };

    const handleStopBuy = () => {
      root.$bvModal
        .msgBoxConfirm('Stop buying? Freqtrade will continue to handle open trades.')
        .then((value: boolean) => {
          if (value) {
            stopBuy();
          }
        });
    };

    const handleReloadConfig = () => {
      root.$bvModal.msgBoxConfirm('Reload configuration?').then((value: boolean) => {
        if (value) {
          reloadConfig();
        }
      });
    };

    const handleForceSell = () => {
      root.$bvModal.msgBoxConfirm(`Really forcesell ALL trades?`).then((value: boolean) => {
        if (value) {
          const payload: ForceSellPayload = {
            tradeid: 'all',
            // TODO: support ordertype (?)
          };
          forcesell(payload);
        }
      });
    };
    return {
      initiateForceenter,
      handleStopBot,
      handleStopBuy,
      handleReloadConfig,
      handleForceSell,
      forcebuyShow,
      isTrading,
      isRunning,
      botState,
      isWebserverMode,
      startBot,
    };
  },
});
</script>
