<template>
  <div class="container-fluid px-0 backtestresult-container">
    <div class="row d-flex justify-content-center">
      <h3>Backtest-result for {{ backtestResult.strategy_name }}</h3>
    </div>

    <div class="row text-start ms-0">
      <div class="row w-100">
        <div class="col-12 col-xl-6 px-0 px-xl-0 pe-xl-1">
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
        <div class="col-12 col-xl-6 px-0 px-xl-0 pt-2 pt-xl-0 ps-xl-1">
          <b-card header="Metrics">
            <b-table small borderless :items="backtestResultStats" :fields="backtestResultFields">
            </b-table>
          </b-card>
        </div>
      </div>
      <b-card header="Results per Exit-reason" class="row mt-2 w-100">
        <b-table
          small
          hover
          stacked="sm"
          :items="(backtestResult.exit_reason_summary || backtestResult.sell_reason_summary) as unknown as TableItem[]"
          :fields="perExitReason"
        >
        </b-table>
      </b-card>
      <b-card header="Results per pair" class="row mt-2 w-100">
        <b-table
          small
          hover
          stacked="sm"
          :items="backtestResult.results_per_pair as unknown as TableItem[]"
          :fields="perPairFields"
        >
        </b-table>
      </b-card>
      <b-card
        v-if="backtestResult.periodic_breakdown"
        header="`Periodic breakdown"
        class="row mt-2 w-100"
      >
        <b-form-radio-group
          id="order-direction"
          v-model="periodicBreakdownPeriod"
          :options="periodicBreakdownSelections"
          name="radios-btn-default"
          size="sm"
          buttons
          style="min-width: 10em"
          button-variant="outline-primary"
        ></b-form-radio-group>
        <b-table
          small
          hover
          stacked="sm"
          :items="periodicBreakdownItems"
          :fields="periodicBreakdownFields"
        >
        </b-table>
      </b-card>

      <b-card header="Single trades" class="row mt-2 w-100">
        <TradeList
          class="row trade-history mt-2 w-100"
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

import { computed, ref } from 'vue';
import {
  timestampms,
  formatPercent,
  formatPrice,
  humanizeDurationFromSeconds,
} from '@/shared/formatters';
import { TableField, TableItem } from 'bootstrap-vue-next';

const props = defineProps({
  backtestResult: { required: true, type: Object as () => StrategyBacktestResult },
});

const formatPriceStake = (price) => {
  return `${formatPrice(price, props.backtestResult.stake_currency_decimals)} ${
    props.backtestResult.stake_currency
  }`;
};
const getSortedTrades = (backtestResult: StrategyBacktestResult): Trade[] => {
  const sortedTrades = backtestResult.trades
    .slice()
    .sort((a, b) => a.profit_ratio - b.profit_ratio);
  return sortedTrades;
};

const bestPair = computed((): string => {
  const trades = getSortedTrades(props.backtestResult);
  if (trades.length === 0) {
    return 'N/A';
  }
  const value = trades[trades.length - 1];
  return `${value.pair} ${formatPercent(value.profit_ratio, 2)}`;
});
const worstPair = computed((): string => {
  const trades = getSortedTrades(props.backtestResult);
  if (trades.length === 0) {
    return 'N/A';
  }
  const value = trades[0];
  return `${value.pair} ${formatPercent(value.profit_ratio, 2)}`;
});

const backtestResultStats = computed(() => {
  // Transpose Result into readable format
  const shortMetrics =
    props.backtestResult?.trade_count_short && props.backtestResult?.trade_count_short > 0
      ? [
          { metric: '___', value: '___' },
          {
            metric: 'Long / Short',
            value: `${props.backtestResult.trade_count_long} / ${props.backtestResult.trade_count_short}`,
          },
          {
            metric: 'Total profit Long',
            value: `${formatPercent(
              props.backtestResult.profit_total_long || 0,
            )} | ${formatPriceStake(props.backtestResult.profit_total_long_abs)}`,
          },
          {
            metric: 'Total profit Short',
            value: `${formatPercent(
              props.backtestResult.profit_total_short || 0,
            )} | ${formatPriceStake(props.backtestResult.profit_total_short_abs)}`,
          },
        ]
      : [];

  return [
    {
      metric: 'Total Profit',
      value: `${formatPercent(props.backtestResult.profit_total)} | ${formatPriceStake(
        props.backtestResult.profit_total_abs,
      )}`,
    },
    {
      metric: 'CAGR',
      value: `${props.backtestResult.cagr ? formatPercent(props.backtestResult.cagr) : 'N/A'}`,
    },
    {
      metric: 'Sortino',
      value: `${props.backtestResult.sortino ? props.backtestResult.sortino.toFixed(2) : 'N/A'}`,
    },
    {
      metric: 'Sharpe',
      value: `${props.backtestResult.sharpe ? props.backtestResult.sharpe.toFixed(2) : 'N/A'}`,
    },
    {
      metric: 'Calmar',
      value: `${props.backtestResult.calmar ? props.backtestResult.calmar.toFixed(2) : 'N/A'}`,
    },
    {
      metric: 'Expectancy',
      value: `${
        props.backtestResult.expectancy ? props.backtestResult.expectancy.toFixed(2) : 'N/A'
      }`,
    },
    {
      metric: 'Profit factor',
      value: `${
        props.backtestResult.profit_factor
          ? formatPrice(props.backtestResult.profit_factor, 3)
          : 'N/A'
      }`,
    },
    {
      metric: 'Total trades / Daily Avg Trades',
      value: `${props.backtestResult.total_trades} / ${props.backtestResult.trades_per_day}`,
    },
    // { metric: 'First trade', value: props.backtestResult.backtest_fi },
    // { metric: 'First trade Pair', value: props.backtestResult.backtest_best_day },
    {
      metric: 'Best day',
      value: `${formatPercent(props.backtestResult.backtest_best_day, 2)} | ${formatPriceStake(
        props.backtestResult.backtest_best_day_abs,
      )}`,
    },
    {
      metric: 'Worst day',
      value: `${formatPercent(props.backtestResult.backtest_worst_day, 2)} | ${formatPriceStake(
        props.backtestResult.backtest_worst_day_abs,
      )}`,
    },

    {
      metric: 'Win/Draw/Loss',
      value: `${
        props.backtestResult.results_per_pair[props.backtestResult.results_per_pair.length - 1].wins
      } / ${
        props.backtestResult.results_per_pair[props.backtestResult.results_per_pair.length - 1]
          .draws
      } / ${
        props.backtestResult.results_per_pair[props.backtestResult.results_per_pair.length - 1]
          .losses
      }`,
    },
    {
      metric: 'Days win/draw/loss',
      value: `${props.backtestResult.winning_days} / ${props.backtestResult.draw_days} / ${props.backtestResult.losing_days}`,
    },

    {
      metric: 'Avg. Duration winners',
      value: humanizeDurationFromSeconds(props.backtestResult.winner_holding_avg_s),
    },
    {
      metric: 'Avg. Duration Losers',
      value: humanizeDurationFromSeconds(props.backtestResult.loser_holding_avg_s),
    },
    { metric: 'Rejected entry signals', value: props.backtestResult.rejected_signals },
    {
      metric: 'Entry/Exit timeouts',
      value: `${props.backtestResult.timedout_entry_orders} / ${props.backtestResult.timedout_exit_orders}`,
    },
    {
      metric: 'Canceled Trade Entries',
      value: props.backtestResult.canceled_trade_entries ?? 'N/A',
    },
    {
      metric: 'Canceled Entry Orders',
      value: props.backtestResult.canceled_entry_orders ?? 'N/A',
    },
    {
      metric: 'Replaced Entry Orders',
      value: props.backtestResult.replaced_entry_orders ?? 'N/A',
    },

    ...shortMetrics,

    { metric: '___', value: '___' },
    { metric: 'Min balance', value: formatPriceStake(props.backtestResult.csum_min) },
    { metric: 'Max balance', value: formatPriceStake(props.backtestResult.csum_max) },
    { metric: 'Market change', value: formatPercent(props.backtestResult.market_change) },
    { metric: '___', value: '___' },
    {
      metric: 'Max Drawdown (Account)',
      value: formatPercent(props.backtestResult.max_drawdown_account),
    },
    {
      metric: 'Max Drawdown ABS',
      value: formatPriceStake(props.backtestResult.max_drawdown_abs),
    },
    {
      metric: 'Drawdown high | low',
      value: `${formatPriceStake(props.backtestResult.max_drawdown_high)} | ${formatPriceStake(
        props.backtestResult.max_drawdown_low,
      )}`,
    },
    { metric: 'Drawdown start', value: timestampms(props.backtestResult.drawdown_start_ts) },
    { metric: 'Drawdown end', value: timestampms(props.backtestResult.drawdown_end_ts) },
    { metric: '___', value: '___' },

    {
      metric: 'Best Pair',
      value: `${props.backtestResult.best_pair.key} ${formatPercent(
        props.backtestResult.best_pair.profit_sum,
      )}`,
    },
    {
      metric: 'Worst Pair',
      value: `${props.backtestResult.worst_pair.key} ${formatPercent(
        props.backtestResult.worst_pair.profit_sum,
      )}`,
    },
    { metric: 'Best single Trade', value: bestPair.value },
    { metric: 'Worst single Trade', value: worstPair.value },
  ];
});

const backtestResultSettings = computed(() => {
  // Transpose Result into readable format
  return [
    { setting: 'Backtesting from', value: timestampms(props.backtestResult.backtest_start_ts) },
    { setting: 'Backtesting to', value: timestampms(props.backtestResult.backtest_end_ts) },
    {
      setting: 'BT execution time',
      value: humanizeDurationFromSeconds(
        props.backtestResult.backtest_run_end_ts - props.backtestResult.backtest_run_start_ts,
      ),
    },
    { setting: 'Max open trades', value: props.backtestResult.max_open_trades },
    { setting: 'Timeframe', value: props.backtestResult.timeframe },
    { setting: 'Timeframe Detail', value: props.backtestResult.timeframe_detail || 'N/A' },
    { setting: 'Timerange', value: props.backtestResult.timerange },
    { setting: 'Stoploss', value: formatPercent(props.backtestResult.stoploss, 2) },
    { setting: 'Trailing Stoploss', value: props.backtestResult.trailing_stop },
    {
      setting: 'Trail only when offset is reached',
      value: props.backtestResult.trailing_only_offset_is_reached,
    },
    { setting: 'Trailing Stop positive', value: props.backtestResult.trailing_stop_positive },
    {
      setting: 'Trailing stop positive offset',
      value: props.backtestResult.trailing_stop_positive_offset,
    },
    { setting: 'Custom Stoploss', value: props.backtestResult.use_custom_stoploss },
    { setting: 'ROI', value: props.backtestResult.minimal_roi },
    {
      setting: 'Use Exit Signal',
      value:
        props.backtestResult.use_exit_signal !== undefined
          ? props.backtestResult.use_exit_signal
          : props.backtestResult.use_sell_signal,
    },
    {
      setting: 'Exit profit only',
      value:
        props.backtestResult.exit_profit_only !== undefined
          ? props.backtestResult.exit_profit_only
          : props.backtestResult.sell_profit_only,
    },
    {
      setting: 'Exit profit offset',
      value:
        props.backtestResult.exit_profit_offset !== undefined
          ? props.backtestResult.exit_profit_offset
          : props.backtestResult.sell_profit_offset,
    },
    { setting: 'Enable protections', value: props.backtestResult.enable_protections },
    {
      setting: 'Starting balance',
      value: formatPriceStake(props.backtestResult.starting_balance),
    },
    {
      setting: 'Final balance',
      value: formatPriceStake(props.backtestResult.final_balance),
    },
    {
      setting: 'Avg. stake amount',
      value: formatPriceStake(props.backtestResult.avg_stake_amount),
    },
    {
      setting: 'Total trade volume',
      value: formatPriceStake(props.backtestResult.total_volume),
    },
  ];
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

const periodicBreakdownSelections = [
  { value: 'day', text: 'Days' },
  { value: 'week', text: 'Weeks' },
  { value: 'month', text: 'Months' },
];

const periodicBreakdownPeriod = ref<string>('day');

const periodicBreakdownItems = computed<TableItem[]>(() => {
  return props.backtestResult?.periodic_breakdown
    ? props.backtestResult?.periodic_breakdown[periodicBreakdownPeriod.value] ??
        ([] as unknown as TableItem[])
    : [];
});

const periodicBreakdownFields = computed<TableField[]>(() => {
  return [
    { key: 'date', label: 'Date' },
    { key: 'wins', label: 'Wins' },
    { key: 'draws', label: 'Draws' },
    { key: 'loses', label: 'Losses' },
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

<style lang="scss" scoped>
.backtestresult-container {
  @media (min-width: 1200px) {
    max-width: 1200px;
  }
}
</style>
