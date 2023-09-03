<template>
  <div>
    <div class="mb-2">
      <label class="me-auto h3">Period Breakdown</label>
      <b-button class="float-end" size="sm" @click="refreshSummary">
        <i-mdi-refresh />
      </b-button>
    </div>
    <b-form-radio-group
      v-if="hasWeekly"
      id="order-direction"
      v-model="periodicBreakdownPeriod"
      :options="periodicBreakdownSelections"
      name="radios-btn-default"
      size="sm"
      buttons
      style="min-width: 10em"
      button-variant="outline-primary"
      @change="refreshSummary"
    ></b-form-radio-group>

    <div class="ps-1">
      <DailyChart v-if="selectedStats" :daily-stats="selectedStatsSorted" :show-title="false" />
    </div>
    <div>
      <b-table class="table-sm" :items="selectedStats.data" :fields="dailyFields"> </b-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import DailyChart from '@/components/charts/DailyChart.vue';
import { formatPercent, formatPrice } from '@/shared/formatters';
import { useBotStore } from '@/stores/ftbotwrapper';
import { TableField } from 'bootstrap-vue-next';
import { computed, onMounted, ref } from 'vue';

import { TimeSummaryOptions } from '@/types';

const botStore = useBotStore();

const hasWeekly = computed(() => botStore.activeBot.botApiVersion >= 2.33);

const periodicBreakdownSelections = computed(() => {
  const vals = [{ value: TimeSummaryOptions.daily, text: 'Days' }];
  if (hasWeekly.value) {
    vals.push({ value: TimeSummaryOptions.weekly, text: 'Weeks' });
    vals.push({ value: TimeSummaryOptions.monthly, text: 'Months' });
  }
  return vals;
});
const periodicBreakdownPeriod = ref<TimeSummaryOptions>(TimeSummaryOptions.daily);

const selectedStats = computed(() => {
  switch (periodicBreakdownPeriod.value) {
    case TimeSummaryOptions.weekly:
      return botStore.activeBot.weeklyStats;
    case TimeSummaryOptions.monthly:
      return botStore.activeBot.monthlyStats;
  }
  return botStore.activeBot.dailyStats;
});

const selectedStatsSorted = computed(() => {
  // Sorted version for chart
  return {
    ...selectedStats.value,
    data: selectedStats.value.data
      ? Object.values(selectedStats.value.data).sort((a, b) => (a.date > b.date ? 1 : -1))
      : [],
  };
});

const dailyFields = computed<TableField[]>(() => {
  const res: TableField[] = [
    { key: 'date', label: 'Day' },
    {
      key: 'abs_profit',
      label: 'Profit',
      formatter: (value: unknown) =>
        formatPrice(value as number, botStore.activeBot.stakeCurrencyDecimals),
    },
    {
      key: 'fiat_value',
      label: `In ${botStore.activeBot.dailyStats.fiat_display_currency}`,
      formatter: (value: unknown) => formatPrice(value as number, 2),
    },
    { key: 'trade_count', label: 'Trades' },
  ];
  if (botStore.activeBot.botApiVersion >= 2.16)
    res.push({
      key: 'rel_profit',
      label: 'Profit%',
      formatter: (value: unknown) => formatPercent(value as number, 2),
    });
  return res;
});

function refreshSummary() {
  botStore.activeBot.getTimeSummary(periodicBreakdownPeriod.value);
}

onMounted(() => {
  refreshSummary();
});
</script>
