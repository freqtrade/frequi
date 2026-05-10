<script setup lang="ts">
import type { ForceExitPayload } from '@/types';

const botStore = useBotStore();
const { confirm } = useConfirmBox();

const { forceEntryDialog } = useForceTrade();

const isRunning = computed((): boolean => {
  return botStore.activeBot.botState?.state === 'running';
});

async function handleStopBot() {
  const result = await confirm({
    title: 'Stop Bot',
    message: 'Stop the bot loop from running?',
  });
  if (result) {
    botStore.activeBot.stopBot();
  }
}

async function handleStopBuy() {
  if (
    await confirm({
      title: 'Pause - Stop Entering',
      message:
        'Freqtrade will continue to handle open trades, but will not enter new trades or increase position sizes. \nReally stop entering?',
    })
  ) {
    botStore.activeBot.stopBuy();
  }
}

async function handleReloadConfig() {
  if (
    await confirm({
      title: 'Reload Config',
      message: 'Reload configuration (including strategy)?',
    })
  ) {
    botStore.activeBot.reloadConfig();
  }
}

async function handleForceExit() {
  if (
    await confirm({
      title: 'ForceExit all',
      message: 'Really forceexit ALL trades?',
    })
  ) {
    const payload: ForceExitPayload = {
      tradeid: 'all',
      // TODO: support ordertype (?)
    };
    botStore.activeBot.forceexit(payload);
  }
}

async function handleForceEntry() {
  await forceEntryDialog({
    pair: botStore.activeBot.selectedPair,
  });
}
</script>

<template>
  <div class="flex flex-row gap-1">
    <UButton
      size="xl"
      color="neutral"
      :disabled="!botStore.activeBot.isTrading || isRunning"
      title="Start Trading"
      icon="mdi:play"
      @click="botStore.activeBot.startBot()"
    />
    <UButton
      size="xl"
      color="neutral"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Stop Trading - Also stops handling open trades."
      icon="mdi:stop"
      @click="handleStopBot()"
    />
    <UButton
      size="xl"
      color="neutral"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Pause (StopBuy) - Freqtrade will continue to handle open trades, but will not enter new trades or increase position sizes."
      icon="mdi:pause"
      @click="handleStopBuy()"
    />
    <UButton
      size="xl"
      color="neutral"
      :disabled="!botStore.activeBot.isTrading"
      title="Reload Config - reloads configuration including strategy, resetting all settings changed on the fly."
      icon="mdi:reload"
      @click="handleReloadConfig()"
    />
    <UButton
      color="neutral"
      size="xl"
      :disabled="!botStore.activeBot.isTrading"
      title="Force exit all"
      icon="mdi:close-box-multiple"
      @click="handleForceExit()"
    />
    <UButton
      v-if="botStore.activeBot.botState && botStore.activeBot.botState.force_entry_enable"
      size="xl"
      color="neutral"
      :disabled="!botStore.activeBot.isTrading || !isRunning"
      title="Force enter - Immediately enter a trade at an optional price. Exits are then handled according to strategy rules."
      icon="mdi:plus-box-multiple-outline"
      @click="handleForceEntry"
    />
    <UButton
      v-if="botStore.activeBot.isWebserverMode && false"
      size="xl"
      color="neutral"
      :disabled="botStore.activeBot.isTrading"
      title="Start Trading mode"
      icon="mdi:play"
      @click="botStore.activeBot.startTrade()"
    />
  </div>
</template>
