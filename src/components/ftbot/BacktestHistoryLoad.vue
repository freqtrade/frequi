<script setup lang="ts">
import type { MsgBoxObject } from '@/components/general/MessageBox.vue';
import MessageBox from '@/components/general/MessageBox.vue';

import type { BacktestHistoryEntry } from '@/types';
import type { TableColumn } from '@nuxt/ui';
import InfoBox from '../general/InfoBox.vue';

const botStore = useBotStore();
const msgBox = ref<typeof MessageBox>();
const filterText = ref('');
const filterTextDebounced = refDebounced(filterText, 350, { maxWait: 1000 });

onMounted(() => {
  botStore.activeBot.getBacktestHistory();
});

function deleteBacktestResult(result: BacktestHistoryEntry) {
  const msg: MsgBoxObject = {
    title: 'Delete result',
    message: `Delete result ${result.filename} from disk?`,
    accept: () => {
      botStore.activeBot.deleteBacktestHistoryResult(result);
    },
  };
  msgBox.value?.show(msg);
}

const filteredList = computed(() =>
  botStore.activeBot.backtestHistoryList.filter(
    (r) =>
      r.filename.toLowerCase().includes(filterTextDebounced.value.toLowerCase()) ||
      r.strategy.toLowerCase().includes(filterTextDebounced.value.toLowerCase()),
  ),
);
const columns: TableColumn<BacktestHistoryEntry>[] = [
  { accessorKey: 'strategy', header: 'Strategy' },
  { accessorKey: 'timeframe', header: 'Details' },
  { accessorKey: 'backtest_start_time', header: 'Backtest Time' },
  { accessorKey: 'filename', header: 'Filename' },
  { id: 'actions', header: 'Actions' },
];
// TODO nuxtui: virtualize needs proper settings!
</script>

<template>
  <div>
    <UButton
      class="float-end"
      title="Refresh"
      aria-label="Refresh"
      variant="outline"
      color="neutral"
      icon="mdi:refresh"
      @click="botStore.activeBot.getBacktestHistory"
    />
    <p>
      Load Historic results from disk. You can click on multiple results to load all of them into
      freqUI.
    </p>
    <div v-if="botStore.activeBot.backtestHistoryList.length > 0" class="flex align-center">
      <UInput
        id="trade-filter"
        v-model="filterText"
        type="text"
        placeholder="Filter results"
        title="Filter results"
      />
    </div>
    <UTable
      v-if="botStore.activeBot.backtestHistoryList.length > 0"
      class="mt-2"
      :data="filteredList"
      :columns="columns"
      virtualize
      @select="(e, row) => botStore.activeBot.getBacktestHistoryResult(row.original)"
    >
      <template #timeframe-cell="{ row }">
        <strong>{{ row.original.timeframe }}</strong>
        <span v-if="row.original.backtest_start_ts && row.original.backtest_end_ts" class="ms-1">
          {{ timestampToTimeRangeString(row.original.backtest_start_ts * 1000) }}-{{
            timestampToTimeRangeString(row.original.backtest_end_ts * 1000)
          }}</span
        >
      </template>
      <template #backtest_start_time-cell="{ row }">
        <DateTimeTZ :date="row.original.backtest_start_time * 1000" />
      </template>
      <template #actions-cell="{ row }">
        <div class="flex items-center">
          <InfoBox
            v-if="botStore.activeBot.botFeatures.backtestSetNotes"
            :class="row.original.notes ? 'opacity-100' : 'opacity-0'"
            :hint="row.original.notes ?? ''"
          ></InfoBox>
          <UButton
            v-if="botStore.activeBot.botFeatures.backtestDelete"
            class="ms-1"
            size="sm"
            variant="solid"
            title="Load this Result."
            icon="mdi:arrow-right"
            :disabled="row.original.run_id in botStore.activeBot.backtestHistory"
            @click.stop="botStore.activeBot.getBacktestHistoryResult(row.original)"
          />
          <UButton
            v-if="botStore.activeBot.botFeatures.backtestDelete"
            class="ms-1"
            size="sm"
            color="neutral"
            title="Delete this Result."
            icon="mdi:delete"
            :disabled="row.original.run_id in botStore.activeBot.backtestHistory"
            @click.stop="deleteBacktestResult(row.original)"
          />
        </div>
      </template>
    </UTable>
  </div>
  <MessageBox ref="msgBox" />
</template>
