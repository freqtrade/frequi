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
      @click="forceEnter = true"
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
    <ForceEntryForm v-model="forceEnter" :pair="botStore.activeBot.selectedPair" />
    <MessageBox ref="msgBox" />
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
import MessageBox, { MsgBoxObject } from '@/components/general/MessageBox.vue';
import { defineComponent, computed, ref } from 'vue';
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
    MessageBox,
  },
  setup() {
    const botStore = useBotStore();
    const forceEnter = ref<boolean>(false);
    const msgBox = ref<typeof MessageBox>();

    const isRunning = computed((): boolean => {
      return botStore.activeBot.botState?.state === 'running';
    });

    const handleStopBot = () => {
      const msg: MsgBoxObject = {
        title: 'Stop Bot',
        message: 'Stop the bot loop from running?',
        accept: () => {
          console.log('stopped...');
          // botStore.activeBot.stopBot();
        },
      };
      msgBox.value?.show(msg);
    };

    const handleStopBuy = () => {
      const msg: MsgBoxObject = {
        title: 'Stop Buying',
        message: 'Freqtrade will continue to handle open trades.',
        accept: () => {
          console.log('stopBuy...');
          botStore.activeBot.stopBuy();
        },
      };
      msgBox.value?.show(msg);
    };

    const handleReloadConfig = () => {
      const msg: MsgBoxObject = {
        title: 'Reload',
        message: 'Reload configuration (including strategy)?',
        accept: () => {
          console.log('reload...');
          botStore.activeBot.reloadConfig();
        },
      };
      msgBox.value?.show(msg);
    };

    const handleForceExit = () => {
      const msg: MsgBoxObject = {
        title: 'ForceExit all',
        message: 'Really forceexit ALL trades?',
        accept: () => {
          console.log('forceexit all...');
          const payload: ForceSellPayload = {
            tradeid: 'all',
            // TODO: support ordertype (?)
          };
          botStore.activeBot.forceexit(payload);
        },
      };
      msgBox.value?.show(msg);
    };
    return {
      handleStopBot,
      handleStopBuy,
      handleReloadConfig,
      handleForceExit,
      forceEnter,
      botStore,
      isRunning,
      msgBox,
    };
  },
});
</script>
