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
  isNotUndefined,
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

const pairSummary = computed(() => {
  return props.backtestResult.results_per_pair[props.backtestResult.results_per_pair.length - 1];
});

const backtestResultStats = computed(() => {
  // Transpose Result into readable format
  const shortMetrics =
    props.backtestResult?.trade_count_short && props.backtestResult?.trade_count_short > 0
      ? [
          { '___ ': '___' },
          {
            'Long / Short': `${props.backtestResult.trade_count_long} / ${props.backtestResult.trade_count_short}`,
          },
          {
            'Total profit Long': `${formatPercent(
              props.backtestResult.profit_total_long || 0,
            )} | ${formatPriceStake(props.backtestResult.profit_total_long_abs)}`,
          },
          {
            'Total profit Short': `${formatPercent(
              props.backtestResult.profit_total_short || 0,
            )} | ${formatPriceStake(props.backtestResult.profit_total_short_abs)}`,
          },
        ]
      : [];

  const tmp = [
    {
      'Total Profit': `${formatPercent(props.backtestResult.profit_total)} | ${formatPriceStake(
        props.backtestResult.profit_total_abs,
      )}`,
    },
    {
      CAGR: `${props.backtestResult.cagr ? formatPercent(props.backtestResult.cagr) : 'N/A'}`,
    },
    {
      Sortino: `${props.backtestResult.sortino ? props.backtestResult.sortino.toFixed(2) : 'N/A'}`,
    },
    {
      Sharpe: `${props.backtestResult.sharpe ? props.backtestResult.sharpe.toFixed(2) : 'N/A'}`,
    },
    {
      Calmar: `${props.backtestResult.calmar ? props.backtestResult.calmar.toFixed(2) : 'N/A'}`,
    },
    {
      [`Expectancy ${props.backtestResult.expectancy_ratio ? '(ratio)' : ''}`]: `${
        props.backtestResult.expectancy
          ? props.backtestResult.expectancy_ratio
            ? props.backtestResult.expectancy.toFixed(2) +
              ' (' +
              props.backtestResult.expectancy_ratio.toFixed(2) +
              ')'
            : props.backtestResult.expectancy.toFixed(2)
          : 'N/A'
      }`,
    },
    {
      'Profit factor': `${
        props.backtestResult.profit_factor
          ? formatPrice(props.backtestResult.profit_factor, 3)
          : 'N/A'
      }`,
    },
    {
      'Total trades / Daily Avg Trades': `${props.backtestResult.total_trades} / ${props.backtestResult.trades_per_day}`,
    },
    // { 'First trade': props.backtestResult.backtest_fi },
    // { 'First trade Pair': props.backtestResult.backtest_best_day },
    {
      'Best day': `${formatPercent(props.backtestResult.backtest_best_day, 2)} | ${formatPriceStake(
        props.backtestResult.backtest_best_day_abs,
      )}`,
    },
    {
      'Worst day': `${formatPercent(
        props.backtestResult.backtest_worst_day,
        2,
      )} | ${formatPriceStake(props.backtestResult.backtest_worst_day_abs)}`,
    },

    {
      'Win/Draw/Loss': `${pairSummary.value.wins} / ${pairSummary.value.draws} / ${
        pairSummary.value.losses
      } ${
        isNotUndefined(pairSummary.value.winrate)
          ? '(WR: ' +
            formatPercent(
              props.backtestResult.results_per_pair[
                props.backtestResult.results_per_pair.length - 1
              ].winrate ?? 0,
              2,
            ) +
            ')'
          : ''
      }`,
    },
    {
      'Days win/draw/loss': `${props.backtestResult.winning_days} / ${props.backtestResult.draw_days} / ${props.backtestResult.losing_days}`,
    },
    {
      'Avg. Duration winners': humanizeDurationFromSeconds(
        props.backtestResult.winner_holding_avg_s,
      ),
    },
    {
      'Avg. Duration Losers': humanizeDurationFromSeconds(props.backtestResult.loser_holding_avg_s),
    },
    {
      'Max Consecutive Wins / Loss':
        props.backtestResult.max_consecutive_wins === undefined
          ? 'N/A'
          : `${props.backtestResult.max_consecutive_wins} / ${props.backtestResult.max_consecutive_losses}`,
    },
    { 'Rejected entry signals': props.backtestResult.rejected_signals },
    {
      'Entry/Exit timeouts': `${props.backtestResult.timedout_entry_orders} / ${props.backtestResult.timedout_exit_orders}`,
    },
    {
      'Canceled Trade Entries': props.backtestResult.canceled_trade_entries ?? 'N/A',
    },
    {
      'Canceled Entry Orders': props.backtestResult.canceled_entry_orders ?? 'N/A',
    },
    {
      'Replaced Entry Orders': props.backtestResult.replaced_entry_orders ?? 'N/A',
    },

    ...shortMetrics,

    { ___: '___' },
    { 'Min balance': formatPriceStake(props.backtestResult.csum_min) },
    { 'Max balance': formatPriceStake(props.backtestResult.csum_max) },
    { 'Market change': formatPercent(props.backtestResult.market_change) },
    { '___  ': '___' },
    {
      'Max Drawdown (Account)': formatPercent(props.backtestResult.max_drawdown_account),
    },
    {
      'Max Drawdown ABS': formatPriceStake(props.backtestResult.max_drawdown_abs),
    },
    {
      'Drawdown high | low': `${formatPriceStake(
        props.backtestResult.max_drawdown_high,
      )} | ${formatPriceStake(props.backtestResult.max_drawdown_low)}`,
    },
    { 'Drawdown start': timestampms(props.backtestResult.drawdown_start_ts) },
    { 'Drawdown end': timestampms(props.backtestResult.drawdown_end_ts) },
    { '___   ': '___' },

    {
      'Best Pair': `${props.backtestResult.best_pair.key} ${formatPercent(
        props.backtestResult.best_pair.profit_sum,
      )}`,
    },
    {
      'Worst Pair': `${props.backtestResult.worst_pair.key} ${formatPercent(
        props.backtestResult.worst_pair.profit_sum,
      )}`,
    },
    { 'Best single Trade': bestPair.value },
    { 'Worst single Trade': worstPair.value },
  ];
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
