<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const botStore = useBotStore();
const settingsStore = useSettingsStore();

const multiPaneTab = ref('pairs');

const tabs: { value: string; label: string; icon: string }[] = [
  { value: 'pairs', label: 'Pairs combined', icon: 'i-mdi-view-list' },
  { value: 'general', label: 'General', icon: 'i-mdi-information' },
  { value: 'performance', label: 'Performance', icon: 'i-mdi-chart-line' },
  { value: 'balance', label: 'Balance', icon: 'i-mdi-bank' },
  { value: 'time-breakdown', label: 'Time Breakdown', icon: 'i-mdi-folder-clock' },
  { value: 'pairlist', label: 'Pairlist', icon: 'i-mdi-format-list-group' },
  { value: 'pair-locks', label: 'Pair Locks', icon: 'i-mdi-lock-alert' },
];

const tradingTabItems = computed<TabsItem[]>(() =>
  tabs.map((t) => ({
    slot: t.value,
    value: t.value,
    label: settingsStore.multiPaneButtonsShowText ? t.label : undefined,
    icon: t.icon,
  })),
);
</script>

<template>
  <div>
    <div class="mt-1 flex justify-center">
      <BotControls class="mt-1 mb-2" />
    </div>
    <UTabs v-model="multiPaneTab" color="neutral" :items="tradingTabItems" variant="link">
      <template #pairs>
        <PairSummary
          :pairlist="botStore.activeBot.whitelist"
          :current-locks="botStore.activeBot.activeLocks"
          :trades="botStore.activeBot.openTrades"
        />
      </template>
      <template #general>
        <BotStatus />
      </template>
      <template #performance>
        <BotPerformance />
      </template>
      <template #balance>
        <BotBalance />
      </template>
      <template #time-breakdown>
        <PeriodBreakdown />
      </template>
      <template #pairlist>
        <PairListLive />
      </template>
      <template #pair-locks>
        <PairLockList />
      </template>
    </UTabs>
  </div>
</template>
