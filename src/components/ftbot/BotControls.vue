forceexit
<template>
  <div>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || isRunning"
      title="Start Trading"
      @click="botStore.activeBot.startBot()"
    >
      <PlayIcon />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Stop Trading - Also stops handling open trades."
      @click="handleStopBot()"
    >
      <StopIcon />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="StopBuy - Stops buying, but still handles open trades"
      @click="handleStopBuy()"
    >
      <PauseIcon />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading"
      title="Reload Config - reloads configuration including strategy, resetting all settings changed on the fly."
      @click="handleReloadConfig()"
    >
      <ReloadIcon />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading"
      title="Force exit all"
      @click="handleForceExit()"
    >
      <ForceExitIcon />
    </button>
    <button
      v-if="
        botStore.activeBot.botState &&
        (botStore.activeBot.botState.force_entry_enable ||
          botStore.activeBot.botState.forcebuy_enabled)
      "
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Force enter - Immediately enter a trade at an optional price. Exits are then handled according to strategy rules."
      @click="initiateForceenter"
    >
      <ForceEntryIcon />
    </button>
    <button
      v-if="botStore.activeBot.isWebserverMode && false"
      :disabled="botStore.activeBot.isTrading"
      class="btn btn-secondary btn-sm ms-1"
      title="Start Trading mode"
      @click="botStore.activeBot.startTrade()"
    >
      <PlayIcon />
    </button>
    <ForceEntryForm :pair="botStore.activeBot.selectedPair" @close="hideForceenter" />
  </div>
</template>

<script lang="ts">
import { ForceSellPayload } from '@/types';
import PlayIcon from 'vue-material-design-icons/Play.vue';
import StopIcon from 'vue-material-design-icons/Stop.vue';
import PauseIcon from 'vue-material-design-icons/Pause.vue';
import ReloadIcon from 'vue-material-design-icons/Reload.vue';
import ForceExitIcon from 'vue-material-design-icons/CloseBoxMultiple.vue';
import ForceEntryIcon from 'vue-material-design-icons/PlusBoxMultipleOutline.vue';
import ForceEntryForm from './ForceEntryForm.vue';
import { defineComponent, computed, ref, getCurrentInstance } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'BotControls',
  components: {
    ForceEntryForm,
    PlayIcon,
    StopIcon,
    PauseIcon,
    ReloadIcon,
    ForceExitIcon,
    ForceEntryIcon,
  },
  setup() {
    const root = getCurrentInstance();
    const botStore = useBotStore();
    const forcebuyShow = ref(false);

    const isRunning = computed((): boolean => {
      return botStore.activeBot.botState?.state === 'running';
    });

    const initiateForceenter = () => {
      root?.proxy.$bvModal.show('forceentry-modal');
    };
    const hideForceenter = () => {
      root?.proxy.$bvModal.hide('forceentry-modal');
    };

    const handleStopBot = () => {
      root?.proxy.$bvModal.msgBoxConfirm('Stop Bot?').then((value: boolean) => {
        if (value) {
          botStore.activeBot.stopBot();
        }
      });
    };

    const handleStopBuy = () => {
      root?.proxy.$bvModal
        .msgBoxConfirm('Stop buying? Freqtrade will continue to handle open trades.')
        .then((value: boolean) => {
          if (value) {
            botStore.activeBot.stopBuy();
          }
        });
    };

    const handleReloadConfig = () => {
      root?.proxy.$bvModal.msgBoxConfirm('Reload configuration?').then((value: boolean) => {
        if (value) {
          botStore.activeBot.reloadConfig();
        }
      });
    };

    const handleForceExit = () => {
      root?.proxy.$bvModal.msgBoxConfirm(`Really forceexit ALL trades?`).then((value: boolean) => {
        if (value) {
          const payload: ForceSellPayload = {
            tradeid: 'all',
            // TODO: support ordertype (?)
          };
          botStore.activeBot.forceexit(payload);
        }
      });
    };
    return {
      initiateForceenter,
      hideForceenter,
      handleStopBot,
      handleStopBuy,
      handleReloadConfig,
      handleForceExit,
      forcebuyShow,
      botStore,
      isRunning,
    };
  },
});
</script>
