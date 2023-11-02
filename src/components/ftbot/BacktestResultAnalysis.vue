<template>
  <div class="px-0 mw-100">
    <div class="d-flex justify-content-center">
      <h3>Backtest-result for {{ backtestResult.strategy_name }}</h3>
    </div>

    <div class="d-flex flex-column text-start ms-0 me-2 gap-2">
      <div class="d-flex flex-column flex-xl-row">
        <div class="px-0 px-xl-0 pe-xl-1 flex-fill">
          <b-card header="Strategy settings">
            <b-table
              small
              borderless
              :items="backtestResultSettings"
              :fields="backtestsettingFields"
            >
            </b-table>
          </b-card>
        </div>
        <div class="px-0 px-xl-0 pt-2 pt-xl-0 ps-xl-1 flex-fill">
          <b-card header="Metrics">
            <b-table small borderless :items="backtestResultStats" :fields="backtestResultFields">
            </b-table>
          </b-card>
        </div>
      </div>
      <b-card header="Results per Exit-reason">
        <b-table small hover stacked="sm" :items="exitReasonSummary" :fields="perExitReason">
        </b-table>
      </b-card>
      <b-card header="Results per pair">
        <b-table small hover stacked="sm" :items="resultsPerPair" :fields="perPairFields">
        </b-table>
      </b-card>
      <b-card v-if="backtestResult.periodic_breakdown" header="Periodic breakdown">
        <BacktestResultPeriodBreakdown :periodic-breakdown="backtestResult.periodic_breakdown">
        </BacktestResultPeriodBreakdown>
      </b-card>

      <b-card header="Single trades">
        <TradeList
          :trades="backtestResult.trades"
          :show-filter="true"
          :stake-currency="backtestResult.stake_currency"
        />
      </b-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StrategyBacktestResult } from '@/types';
import { formatObjectForTable } from '@/shared/objectToTableItems';

import { computed } from 'vue';
import { formatPercent, formatPrice } from '@/shared/formatters';
import { generateBacktestMetricRows, generateBacktestSettingRows } from '@/shared/backtestMetrics';
import { TableField, TableItem } from 'bootstrap-vue-next';

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

const resultsPerPair = computed(
  () => props.backtestResult.results_per_pair as unknown as TableItem[],
);
const exitReasonSummary = computed(
  () =>
    (props.backtestResult.exit_reason_summary ||
      props.backtestResult.sell_reason_summary) as unknown as TableItem[],
);

const perPairFields = computed(() => {
  return [
    { key: 'key', label: 'Pair' },
    { key: 'trades', label: 'Buys' },
    {
      key: 'profit_mean',
      label: 'Avg Profit %',
      formatter: (value) => formatPercent(value, 2),
    },
    { key: 'profit_sum', label: 'Cum Profit %', formatter: (value) => formatPercent(value, 2) },
    {
      key: 'profit_total_abs',
      label: `Tot Profit ${props.backtestResult.stake_currency}`,
      formatter: (value) => formatPrice(value, props.backtestResult.stake_currency_decimals),
    },
    {
      key: 'profit_total',
      label: 'Tot Profit %',
      formatter: (value) => formatPercent(value, 2),
    },
    { key: 'duration_avg', label: 'Avg Duration' },
    { key: 'wins', label: 'Wins' },
    { key: 'draws', label: 'Draws' },
    { key: 'losses', label: 'Losses' },
  ];
});

const perExitReason = computed(() => {
  return [
    { key: 'exit_reason', label: 'Exit Reason' },
    { key: 'trades', label: 'Buys' },
    {
      key: 'profit_mean',
      label: 'Avg Profit %',
      formatter: (value) => formatPercent(value, 2),
    },
    { key: 'profit_sum', label: 'Cum Profit %', formatter: (value) => formatPercent(value, 2) },
    {
      key: 'profit_total_abs',
      label: `Tot Profit ${props.backtestResult.stake_currency}`,

      formatter: (value) => formatPrice(value, props.backtestResult.stake_currency_decimals),
    },
    {
      key: 'profit_total',
      label: 'Tot Profit %',
      formatter: (value) => formatPercent(value, 2),
    },
    { key: 'wins', label: 'Wins' },
    { key: 'draws', label: 'Draws' },
    { key: 'losses', label: 'Losses' },
  ];
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

<style lang="scss" scoped></style>
