<script setup lang="ts">
import { StrategyBacktestResult } from '@/types';

import { TableField } from 'bootstrap-vue-next';

const props = defineProps({
  backtestResult: { required: true, type: Object as () => StrategyBacktestResult },
});

const backtestResultStats = computed(() => {
  const tmp = generateBacktestMetricRows(props.backtestResult);
  return formatObjectForTable({ value: tmp }, 'metric');
});

const backtestResultSettings = computed(() => {
  // Transpose Result into readable format
  const tmp = generateBacktestSettingRows(props.backtestResult);

  return formatObjectForTable({ value: tmp }, 'setting');
});
const backtestResultFields: TableField[] = [
  { key: 'metric', label: 'Metric' },
  { key: 'value', label: 'Value' },
];

const backtestsettingFields: TableField[] = [
  { key: 'setting', label: 'Setting' },
  { key: 'value', label: 'Value' },
];
</script>

<template>
  <div class="px-0 mw-100">
    <div class="d-flex justify-content-center">
      <h3>Backtest-result for {{ backtestResult.strategy_name }}</h3>
    </div>

    <div class="d-flex flex-column text-start ms-0 me-2 gap-2">
      <div class="d-flex flex-column flex-xl-row">
        <div class="px-0 px-xl-0 pe-xl-1 flex-fill">
          <BCard header="Strategy settings">
            <BTable
              small
              borderless
              :items="backtestResultSettings"
              :fields="backtestsettingFields"
            >
            </BTable>
          </BCard>
        </div>
        <div class="px-0 px-xl-0 pt-2 pt-xl-0 ps-xl-1 flex-fill">
          <BCard header="Metrics">
            <BTable small borderless :items="backtestResultStats" :fields="backtestResultFields">
            </BTable>
          </BCard>
        </div>
      </div>
      <BacktestResultTablePer
        title="Results per Enter tag"
        :results="backtestResult.results_per_enter_tag"
        :stake-currency="backtestResult.stake_currency"
        key-header="Enter Tag"
        :stake-currency-decimals="backtestResult.stake_currency_decimals"
      />

      <BacktestResultTablePer
        title="Results per Exit reason"
        :results="backtestResult.exit_reason_summary ?? []"
        :stake-currency="backtestResult.stake_currency"
        key-header="Exit Reason"
        :stake-currency-decimals="backtestResult.stake_currency_decimals"
      />

      <BacktestResultTablePer
        v-if="backtestResult.mix_tag_stats"
        title="Results Mixed Tag"
        :results="backtestResult.mix_tag_stats ?? []"
        :stake-currency="backtestResult.stake_currency"
        :key-headers="['Enter Tag', 'Exit Tag']"
        :stake-currency-decimals="backtestResult.stake_currency_decimals"
      />

      <BacktestResultTablePer
        title="Results per pair"
        :results="backtestResult.results_per_pair"
        :stake-currency="backtestResult.stake_currency"
        key-header="Pair"
        :stake-currency-decimals="backtestResult.stake_currency_decimals"
      />
      <BCard v-if="backtestResult.periodic_breakdown" header="Periodic breakdown">
        <BacktestResultPeriodBreakdown :periodic-breakdown="backtestResult.periodic_breakdown">
        </BacktestResultPeriodBreakdown>
      </BCard>

      <BCard header="Single trades">
        <TradeList
          :trades="backtestResult.trades"
          :show-filter="true"
          :stake-currency="backtestResult.stake_currency"
        />
      </BCard>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
