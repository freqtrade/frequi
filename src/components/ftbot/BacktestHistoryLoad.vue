<script setup lang="ts">
import type { MsgBoxObject } from '@/components/general/MessageBox.vue';
import MessageBox from '@/components/general/MessageBox.vue';

import type { BacktestHistoryEntry } from '@/types';
import InfoBox from '../general/InfoBox.vue';

const botStore = useBotStore();
const { t } = useUiText();
const msgBox = ref<typeof MessageBox>();
const filterText = ref('');
const filterTextDebounced = refDebounced(filterText, 350, { maxWait: 1000 });

onMounted(() => {
  botStore.activeBot.getBacktestHistory();
});

function deleteBacktestResult(result: BacktestHistoryEntry) {
  const msg: MsgBoxObject = {
    title: t('deleteResult'),
    message: t('deleteResultFromDisk', { filename: result.filename }),
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
function rowClick(row) {
  botStore.activeBot.getBacktestHistoryResult(row.data);
}
</script>

<template>
  <div>
    <Button
      class="float-end"
      :title="t('refreshResults')"
      :aria-label="t('refreshResults')"
      variant="outlined"
      severity="secondary"
      @click="botStore.activeBot.getBacktestHistory"
    >
      <i-mdi-refresh />
    </Button>
    <p>
      {{ t('loadHistoricResults') }}
    </p>
    <div v-if="botStore.activeBot.backtestHistoryList.length > 0" class="flex align-center">
      <InputText
        id="trade-filter"
        v-model="filterText"
        type="text"
        size="small"
        :placeholder="t('filterResults')"
        :title="t('filterResults')"
      />
    </div>
    <DataTable
      v-if="botStore.activeBot.backtestHistoryList.length > 0"
      class="mt-2"
      responsive
      size="small"
      scrollable
      scroll-height="50rem"
      :virtual-scroller-options="{ itemSize: 46 }"
      show-gridlines
      :value="filteredList"
      @row-click="rowClick"
    >
      <Column field="strategy" :header="t('strategyLabel')"></Column>
      <Column field="timeframe" :header="t('detailsLabel')">
        <template #body="{ data }">
          <strong>{{ data.timeframe }}</strong>
          <span v-if="data.backtest_start_ts && data.backtest_end_ts" class="ms-1">
            {{ timestampToTimeRangeString(data.backtest_start_ts * 1000) }}-{{
              timestampToTimeRangeString(data.backtest_end_ts * 1000)
            }}</span
          >
        </template>
      </Column>
      <Column field="backtest_start_time" :header="t('backtestTime')">
        <template #body="{ data }">
          <DateTimeTZ :date="data.backtest_start_time * 1000" />
        </template>
      </Column>
      <Column field="filename" :header="t('filename')"></Column>
      <Column field="actions" :header="t('actions')">
        <template #body="{ data }">
          <div class="flex items-center">
            <InfoBox
              v-if="botStore.activeBot.botFeatures.backtestSetNotes"
              :class="data.notes ? 'opacity-100' : 'opacity-0'"
              :hint="data.notes ?? ''"
            ></InfoBox>
            <Button
              v-if="botStore.activeBot.botFeatures.backtestDelete"
              class="ms-1"
              size="small"
              :title="t('loadThisResult')"
              :disabled="data.run_id in botStore.activeBot.backtestHistory"
              @click.stop="botStore.activeBot.getBacktestHistoryResult(data)"
            >
              <template #icon>
                <i-mdi-arrow-right />
              </template>
            </Button>
            <Button
              v-if="botStore.activeBot.botFeatures.backtestDelete"
              class="ms-1"
              size="small"
              severity="secondary"
              :title="t('deleteThisResultTitle')"
              :disabled="data.run_id in botStore.activeBot.backtestHistory"
              @click.stop="deleteBacktestResult(data)"
            >
              <template #icon>
                <i-mdi-delete />
              </template>
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <MessageBox ref="msgBox" />
</template>
