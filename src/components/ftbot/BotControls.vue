forceexit
<template>
  <div>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || isRunning"
      title="Start Trading"
      @click="botStore.activeBot.startBot()"
    >
      <i-mdi-play height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Stop Trading - Also stops handling open trades."
      @click="handleStopBot()"
    >
      <i-mdi-stop height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="StopBuy - Stops buying, but still handles open trades"
      @click="handleStopBuy()"
    >
      <i-mdi-pause height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading"
      title="Reload Config - reloads configuration including strategy, resetting all settings changed on the fly."
      @click="handleReloadConfig()"
    >
      <i-mdi-reload height="24" width="24" />
    </button>
    <button
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading"
      title="Force exit all"
      @click="handleForceExit()"
    >
      <i-mdi-close-box-multiple height="24" width="24" />
    </button>
    <button
      v-if="botStore.activeBot.botState && botStore.activeBot.botState.force_entry_enable"
      class="btn btn-secondary btn-sm ms-1"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Force enter - Immediately enter a trade at an optional price. Exits are then handled according to strategy rules."
      @click="forceEnter = true"
    >
      <i-mdi-plus-box-multiple-outline style="font-size: 20px" />
    </button>
    <button
      v-if="botStore.activeBot.isWebserverMode && false"
      :disabled="botStore.activeBot.isTrading"
      class="btn btn-secondary btn-sm ms-1"
      title="Start Trading mode"
      @click="botStore.activeBot.startTrade()"
    >
      <i-mdi-play class="fs-4" />
    </button>
    <ForceEntryForm v-model="forceEnter" :pair="botStore.activeBot.selectedPair" />
    <MessageBox ref="msgBox" />
  </div>
</template>

<script setup lang="ts">
import MessageBox, { MsgBoxObject } from '@/components/general/MessageBox.vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { ForceSellPayload } from '@/types';
import { computed, ref } from 'vue';

import ForceEntryForm from './ForceEntryForm.vue';

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
      botStore.activeBot.stopBot();
    },
  };
  msgBox.value?.show(msg);
};

const handleStopBuy = () => {
  const msg: MsgBoxObject = {
    title: 'Stop Buying',
    message: 'Freqtrade will continue to handle open trades.',
    accept: () => {
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
      const payload: ForceSellPayload = {
        tradeid: 'all',
        // TODO: support ordertype (?)
      };
      botStore.activeBot.forceexit(payload);
    },
  };
  msgBox.value?.show(msg);
};
</script>
