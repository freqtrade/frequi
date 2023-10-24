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
        <b-table
          small
          hover
          stacked="sm"
          :items="
            (backtestResult.exit_reason_summary ||
              backtestResult.sell_reason_summary) as unknown as TableItem[]
          "
          :fields="perExitReason"
        >
        </b-table>
      </b-card>
      <b-card header="Results per pair">
        <b-table
          small
          hover
          stacked="sm"
          :items="backtestResult.results_per_pair as unknown as TableItem[]"
          :fields="perPairFields"
        >
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
import TradeList from '@/components/ftbot/TradeList.vue';
import { StrategyBacktestResult, Trade } from '@/types';
import BacktestResultPeriodBreakdown from './BacktestResultPeriodBreakdown.vue';
import { formatObjectForTable } from '@/shared/objectToTableItems';

import { computed } from 'vue';
import {
  timestampms,
  formatPercent,
  formatPrice,
  humanizeDurationFromSeconds,
} from '@/shared/formatters';
import { generateBacktestMetricRows } from '@/shared/backtestMetrics';
import { TableField, TableItem } from 'bootstrap-vue-next';

const props = defineProps({
  backtestResult: { required: true, type: Object as () => StrategyBacktestResult },
});

const formatPriceStake = (price) => {
  return `${formatPrice(price, props.backtestResult.stake_currency_decimals)} ${
    props.backtestResult.stake_currency
  }`;
};

const backtestResultStats = computed(() => {
  const tmp = generateBacktestMetricRows(props.backtestResult);
  return formatObjectForTable({ value: tmp }, 'metric');
});

const backtestResultSettings = computed(() => {
  // Transpose Result into readable format
  const tmp = [
    { 'Backtesting from': timestampms(props.backtestResult.backtest_start_ts) },
    { 'Backtesting to': timestampms(props.backtestResult.backtest_end_ts) },
    {
      'BT execution time': humanizeDurationFromSeconds(
        props.backtestResult.backtest_run_end_ts - props.backtestResult.backtest_run_start_ts,
      ),
    },
    { 'Max open trades': props.backtestResult.max_open_trades },
    { Timeframe: props.backtestResult.timeframe },
    { 'Timeframe Detail': props.backtestResult.timeframe_detail || 'N/A' },
    { Timerange: props.backtestResult.timerange },
    { Stoploss: formatPercent(props.backtestResult.stoploss, 2) },
    { 'Trailing Stoploss': props.backtestResult.trailing_stop },
    {
      'Trail only when offset is reached': props.backtestResult.trailing_only_offset_is_reached,
    },
    { 'Trailing Stop positive': props.backtestResult.trailing_stop_positive },
    {
      'Trailing stop positive offset': props.backtestResult.trailing_stop_positive_offset,
    },
    { 'Custom Stoploss': props.backtestResult.use_custom_stoploss },
    { ROI: props.backtestResult.minimal_roi },
    {
      'Use Exit Signal':
        props.backtestResult.use_exit_signal !== undefined
          ? props.backtestResult.use_exit_signal
          : props.backtestResult.use_sell_signal,
    },
    {
      'Exit profit only':
        props.backtestResult.exit_profit_only !== undefined
          ? props.backtestResult.exit_profit_only
          : props.backtestResult.sell_profit_only,
    },
    {
      'Exit profit offset':
        props.backtestResult.exit_profit_offset !== undefined
          ? props.backtestResult.exit_profit_offset
          : props.backtestResult.sell_profit_offset,
    },
    { 'Enable protections': props.backtestResult.enable_protections },
    {
      'Starting balance': formatPriceStake(props.backtestResult.starting_balance),
    },
    {
      'Final balance': formatPriceStake(props.backtestResult.final_balance),
    },
    {
      'Avg. stake amount': formatPriceStake(props.backtestResult.avg_stake_amount),
    },
    {
      'Total trade volume': formatPriceStake(props.backtestResult.total_volume),
    },
  ];

  return formatObjectForTable({ value: tmp }, 'setting');
});
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
