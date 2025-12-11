forceexit
<script setup lang="ts">
import type { MsgBoxObject } from '@/components/general/MessageBox.vue';
import type MessageBox from '@/components/general/MessageBox.vue';

import type { ForceExitPayload } from '@/types';

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
    title: 'Pause - Stop Entering',
    message:
      'Freqtrade will continue to handle open trades, but will not enter new trades or increase position sizes.',
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
      const payload: ForceExitPayload = {
        tradeid: 'all',
        // TODO: support ordertype (?)
      };
      botStore.activeBot.forceexit(payload);
    },
  };
  msgBox.value?.show(msg);
};
</script>

<template>
  <div class="flex flex-row gap-1">
    <Button
      size="large"
      severity="secondary"
      :disabled="!botStore.activeBot.isTrading || isRunning"
      title="Start Trading"
      @click="botStore.activeBot.startBot()"
    >
      <template #icon>
        <i-mdi-play />
      </template>
    </Button>
    <Button
      size="large"
      severity="secondary"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Stop Trading - Also stops handling open trades."
      @click="handleStopBot()"
    >
      <template #icon>
        <i-mdi-stop />
      </template>
    </Button>
    <Button
      size="large"
      severity="secondary"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Pause (StopBuy) - Freqtrade will continue to handle open trades, but will not enter new trades or increase position sizes."
      @click="handleStopBuy()"
    >
      <template #icon>
        <i-mdi-pause />
      </template>
    </Button>
    <Button
      size="large"
      severity="secondary"
      :disabled="!botStore.activeBot.isTrading"
      title="Reload Config - reloads configuration including strategy, resetting all settings changed on the fly."
      @click="handleReloadConfig()"
    >
      <template #icon>
        <i-mdi-reload />
      </template>
    </Button>
    <Button
      severity="secondary"
      size="large"
      :disabled="!botStore.activeBot.isTrading"
      title="Force exit all"
      @click="handleForceExit()"
    >
      <template #icon>
        <i-mdi-close-box-multiple />
      </template>
    </Button>
    <Button
      v-if="botStore.activeBot.botState && botStore.activeBot.botState.force_entry_enable"
      size="large"
      severity="secondary"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Force enter - Immediately enter a trade at an optional price. Exits are then handled according to strategy rules."
      @click="forceEnter = true"
    >
      <template #icon>
        <i-mdi-plus-box-multiple-outline />
      </template>
    </Button>
    <Button
      v-if="botStore.activeBot.isWebserverMode && false"
      size="large"
      severity="secondary"
      :disabled="botStore.activeBot.isTrading"
      title="Start Trading mode"
      @click="botStore.activeBot.startTrade()"
    >
      <template #icon>
        <i-mdi-play />
      </template>
    </Button>
    <ForceEntryForm v-model="forceEnter" :pair="botStore.activeBot.selectedPair" />
    <MessageBox ref="msgBox" />
  </div>
</template>
