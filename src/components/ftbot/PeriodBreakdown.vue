<script setup lang="ts">
import { TimeSummaryOptions } from '@/types';

const botStore = useBotStore();
const settingsStore = useSettingsStore();

const props = defineProps<{
  multiBotView?: boolean;
}>();

const hasWeekly = computed(
  () => botStore.activeBot?.botFeatures?.weeklyMonthlyStats || props.multiBotView,
);

const periodicBreakdownSelections = computed(() => {
  const vals = [{ value: TimeSummaryOptions.daily, text: 'Days' }];
  if (hasWeekly.value) {
    vals.push({ value: TimeSummaryOptions.weekly, text: 'Weeks' });
    vals.push({ value: TimeSummaryOptions.monthly, text: 'Months' });
  }
  return vals;
});

const absRelSelections = ref([
  { value: 'abs_profit', text: 'Abs $' },
  { value: 'rel_profit', text: 'Rel %' },
]);

const selectedStats = computed(() => {
  if (props.multiBotView) {
    switch (settingsStore.timeProfitPeriod) {
      case TimeSummaryOptions.weekly:
        return botStore.allWeeklyStatsSelectedBots;
      case TimeSummaryOptions.monthly:
        return botStore.allMonthlyStatsSelectedBots;
      default:
        return botStore.allDailyStatsSelectedBots;
    }
  }

  switch (settingsStore.timeProfitPeriod) {
    case TimeSummaryOptions.weekly:
      return botStore.activeBot.weeklyStats;
    case TimeSummaryOptions.monthly:
      return botStore.activeBot.monthlyStats;
    default:
      return botStore.activeBot.dailyStats;
  }
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

function refreshSummary() {
  if (props.multiBotView) {
    botStore.allGetTimeSummary(settingsStore.timeProfitPeriod);
  } else {
    botStore.activeBot.getTimeSummary(settingsStore.timeProfitPeriod);
  }
}

onMounted(() => {
  refreshSummary();
});
</script>

<template>
  <div class="flex flex-col h-full">
    <div v-if="!props.multiBotView" class="mb-2">
      <h3 class="me-auto inline text-xl">{{ hasWeekly ? 'Period' : 'Daily' }} Breakdown</h3>
      <Button class="float-end" severity="secondary" @click="refreshSummary">
        <template #icon>
          <i-mdi-refresh />
        </template>
      </Button>
    </div>
    <div class="flex align-center justify-between">
      <SelectButton
        v-if="hasWeekly"
        id="order-direction"
        v-model="settingsStore.timeProfitPeriod"
        :options="periodicBreakdownSelections"
        name="radios-btn-default"
        size="small"
        :allow-empty="false"
        option-label="text"
        option-value="value"
        @change="refreshSummary"
      ></SelectButton>
      <SelectButton
        v-model="settingsStore.timeProfitPreference"
        name="radios-btn-select"
        size="small"
        :allow-empty="false"
        option-label="text"
        option-value="value"
        :options="absRelSelections"
        buttons
        button-variant="outline-primary"
      >
      </SelectButton>
    </div>

    <div
      v-if="
        props.multiBotView &&
        (botStore.selectedBotCount <= 1 || settingsStore.timeProfitPreference != 'rel_profit')
      "
    >
      <TimePeriodChart
        v-if="selectedStats"
        :daily-stats="selectedStatsSorted"
        :show-title="false"
        :profit-col="settingsStore.timeProfitPreference"
      />
    </div>
    <div v-else class="flex items-center justify-center h-full w-full p-2">
      Time period chart is only available when a single bot is selected and showing absolute profit.
    </div>
    <div v-if="!props.multiBotView">
      <DataTable size="small" :value="selectedStats.data">
        <Column field="date" header="Day"></Column>
        <Column field="abs_profit" header="Profit">
          <template #body="{ data, field }">
            {{ formatPrice(data[field], botStore.activeBot.stakeCurrencyDecimals) }}
          </template>
        </Column>
        <Column
          field="fiat_value"
          :header="`In ${botStore.activeBot.dailyStats.fiat_display_currency}`"
        >
          <template #body="{ data, field }">
            {{ formatPrice(data[field], 2) }}
          </template>
        </Column>
        <Column field="trade_count" header="Trades"></Column>
        <Column
          v-if="botStore.activeBot.botFeatures.advancedDailyMetrics"
          field="rel_profit"
          header="Profit%"
        >
          <template #body="{ data, field }">
            {{ formatPercent(data[field], 2) }}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
