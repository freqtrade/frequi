<template>
  <div class="container-fluid px-0 backtestresult-container">
    <div class="row d-flex justify-content-center">
      <h3>Backtest-result for {{ backtestResult.strategy_name }}</h3>
    </div>

    <div class="row text-left ml-0">
      <div class="row w-100">
        <div class="col-12 col-xl-6 px-0 px-xl-0 pr-xl-1">
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
        <div class="col-12 col-xl-6 px-0 px-xl-0 pt-2 pt-xl-0 pl-xl-1">
          <b-card header="Metrics">
            <b-table small borderless :items="backtestResultStats" :fields="backtestResultFields">
            </b-table>
          </b-card>
        </div>
      </div>
      <b-card header="Results per Sell-reason" class="row mt-2 w-100">
        <b-table
          small
          hover
          stacked="sm"
          :items="backtestResult.sell_reason_summary"
          :fields="perSellReason"
        >
        </b-table>
      </b-card>
      <b-card header="Results per pair" class="row mt-2 w-100">
        <b-table
          small
          hover
          stacked="sm"
          :items="backtestResult.results_per_pair"
          :fields="perPairFields"
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

<script lang="ts">
import TradeList from '@/components/ftbot/TradeList.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { StrategyBacktestResult, Trade } from '@/types';

import ValuePair from '@/components/general/ValuePair.vue';

import {
  timestampms,
  formatPercent,
  formatPrice,
  humanizeDurationFromSeconds,
} from '@/shared/formatters';

@Component({
  components: {
    TradeList,
    ValuePair,
  },
})
export default class BacktestResultView extends Vue {
  @Prop({ required: true }) readonly backtestResult!: StrategyBacktestResult;

  get hasBacktestResult() {
    return !!this.backtestResult;
  }

  getSortedTrades(backtestResult: StrategyBacktestResult): Trade[] {
    const sortedTrades = backtestResult.trades
      .slice()
      .sort((a, b) => a.profit_ratio - b.profit_ratio);
    return sortedTrades;
  }

  formatPriceStake(price) {
    return `${formatPrice(price, this.backtestResult.stake_currency_decimals)} ${
      this.backtestResult.stake_currency
    }`;
  }

  get bestPair(): string {
    const trades = this.getSortedTrades(this.backtestResult);
    const value = trades[trades.length - 1];
    return `${value.pair} ${formatPercent(value.profit_ratio, 2)}`;
  }

  get worstPair(): string {
    const trades = this.getSortedTrades(this.backtestResult);
    const value = trades[0];
    return `${value.pair} ${formatPercent(value.profit_ratio, 2)}`;
  }

  get backtestResultStats() {
    // Transpose Result into readable format
    return [
      {
        metric: 'Total Profit',
        value: `${formatPercent(this.backtestResult.profit_total)} | ${this.formatPriceStake(
          this.backtestResult.profit_total_abs,
        )}`,
      },
      {
        metric: 'Total trades / Daily Avg Trades',
        value: `${this.backtestResult.total_trades} / ${this.backtestResult.trades_per_day}`,
      },
      // { metric: 'First trade', value: this.backtestResult.backtest_fi },
      // { metric: 'First trade Pair', value: this.backtestResult.backtest_best_day },
      {
        metric: 'Best day',
        value: `${formatPercent(
          this.backtestResult.backtest_best_day,
          2,
        )} | ${this.formatPriceStake(this.backtestResult.backtest_best_day_abs)}`,
      },
      {
        metric: 'Worst day',
        value: `${formatPercent(
          this.backtestResult.backtest_worst_day,
          2,
        )} | ${this.formatPriceStake(this.backtestResult.backtest_worst_day_abs)}`,
      },

      {
        metric: 'Win/Draw/Loss',
        value: `${
          this.backtestResult.results_per_pair[this.backtestResult.results_per_pair.length - 1].wins
        } / ${
          this.backtestResult.results_per_pair[this.backtestResult.results_per_pair.length - 1]
            .draws
        } / ${
          this.backtestResult.results_per_pair[this.backtestResult.results_per_pair.length - 1]
            .losses
        }`,
      },
      {
        metric: 'Days win/draw/loss',
        value: `${this.backtestResult.winning_days} / ${this.backtestResult.draw_days} / ${this.backtestResult.losing_days}`,
      },

      {
        metric: 'Avg. Duration winners',
        value: humanizeDurationFromSeconds(this.backtestResult.winner_holding_avg),
      },
      {
        metric: 'Avg. Duration Losers',
        value: humanizeDurationFromSeconds(this.backtestResult.loser_holding_avg),
      },
      { metric: 'Rejected buy signals', value: this.backtestResult.rejected_signals },

      { metric: '___', value: '___' },
      { metric: 'Max Drawdown', value: formatPercent(this.backtestResult.max_drawdown) },
      {
        metric: 'Max Drawdown ABS',
        value: this.formatPriceStake(this.backtestResult.max_drawdown_abs),
      },
      { metric: 'Drawdown start', value: timestampms(this.backtestResult.drawdown_start_ts) },
      { metric: 'Drawdown end', value: timestampms(this.backtestResult.drawdown_end_ts) },
      { metric: '___', value: '___' },
      { metric: 'Min balance', value: this.formatPriceStake(this.backtestResult.csum_min) },
      { metric: 'Max balance', value: this.formatPriceStake(this.backtestResult.csum_max) },
      { metric: 'Market change', value: formatPercent(this.backtestResult.market_change) },
      { metric: '___', value: '___' },

      {
        metric: 'Best Pair',
        value: `${this.backtestResult.best_pair.key} ${formatPercent(
          this.backtestResult.best_pair.profit_sum,
        )}`,
      },
      {
        metric: 'Worst Pair',
        value: `${this.backtestResult.worst_pair.key} ${formatPercent(
          this.backtestResult.worst_pair.profit_sum,
        )}`,
      },
      { metric: 'Best single Trade', value: this.bestPair },
      { metric: 'Worst single Trade', value: this.worstPair },
    ];
  }

  timestampms = timestampms;

  formatPercent = formatPercent;

  get backtestResultSettings() {
    // Transpose Result into readable format
    return [
      { setting: 'Backtesting from', value: timestampms(this.backtestResult.backtest_start_ts) },
      { setting: 'Backtesting to', value: timestampms(this.backtestResult.backtest_end_ts) },
      {
        setting: 'BT execution time',
        value: humanizeDurationFromSeconds(
          this.backtestResult.backtest_run_end_ts - this.backtestResult.backtest_run_start_ts,
        ),
      },
      { setting: 'Max open trades', value: this.backtestResult.max_open_trades },
      { setting: 'Timeframe', value: this.backtestResult.timeframe },
      { setting: 'Timerange', value: this.backtestResult.timerange },
      { setting: 'Stoploss', value: formatPercent(this.backtestResult.stoploss, 2) },
      { setting: 'Trailing Stoploss', value: this.backtestResult.trailing_stop },
      {
        setting: 'Trail only when offset is reached',
        value: this.backtestResult.trailing_only_offset_is_reached,
      },
      { setting: 'Trailing Stop positive', value: this.backtestResult.trailing_stop_positive },
      {
        setting: 'Trailing stop positive offset',
        value: this.backtestResult.trailing_stop_positive_offset,
      },
      { setting: 'Custom Stoploss', value: this.backtestResult.use_custom_stoploss },
      { setting: 'ROI', value: this.backtestResult.minimal_roi },
      { setting: 'Use Sell Signal', value: this.backtestResult.use_sell_signal },
      { setting: 'Sell profit only', value: this.backtestResult.sell_profit_only },
      { setting: 'Sell profit offset', value: this.backtestResult.sell_profit_offset },
      { setting: 'Enable protections', value: this.backtestResult.enable_protections },
      {
        setting: 'Starting balance',
        value: this.formatPriceStake(this.backtestResult.starting_balance),
      },
      {
        setting: 'Final balance',
        value: this.formatPriceStake(this.backtestResult.final_balance),
      },
      {
        setting: 'Avg. stake amount',
        value: this.formatPriceStake(this.backtestResult.avg_stake_amount),
      },
      {
        setting: 'Total trade volume',
        value: this.formatPriceStake(this.backtestResult.total_volume),
      },
    ];
  }

  get perPairFields() {
    return [
      { key: 'key', label: 'Pair' },
      { key: 'trades', label: 'Buys' },
      { key: 'profit_mean', label: 'Avg Profit %', formatter: (value) => formatPercent(value, 2) },
      { key: 'profit_sum', label: 'Cum Profit %', formatter: (value) => formatPercent(value, 2) },
      {
        key: 'profit_total_abs',
        label: `Tot Profit ${this.backtestResult.stake_currency}`,
        formatter: (value) => formatPrice(value, this.backtestResult.stake_currency_decimals),
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
  }

  get perSellReason() {
    return [
      { key: 'sell_reason', label: 'Sell Reason' },
      { key: 'trades', label: 'Buys' },
      { key: 'profit_mean', label: 'Avg Profit %', formatter: (value) => formatPercent(value, 2) },
      { key: 'profit_sum', label: 'Cum Profit %', formatter: (value) => formatPercent(value, 2) },
      {
        key: 'profit_total_abs',
        label: `Tot Profit ${this.backtestResult.stake_currency}`,

        formatter: (value) => formatPrice(value, this.backtestResult.stake_currency_decimals),
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
  }

  backtestResultFields: Array<Record<string, string>> = [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
  ];

  backtestsettingFields: Array<Record<string, string>> = [
    { key: 'setting', label: 'Setting' },
    { key: 'value', label: 'Value' },
  ];
}
</script>

<style lang="scss" scoped>
.backtestresult-container {
  @media (min-width: 1200px) {
    max-width: 1200px;
  }
}
</style>
