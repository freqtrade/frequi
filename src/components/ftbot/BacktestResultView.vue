<template>
  <div class="container">
    <div class="row">
      <h2>BacktestResult for {{ strategy }}</h2>
    </div>
    <div class="container">
      <b-card header="Metrics">
        <b-table class="table-sm" :items="backtestResultStats" :fields="backtestResultFields">
        </b-table>
      </b-card>
      <b-card header="Results per pair" class="mt-2">
        <b-table class="table-sm" :items="backtestResult.results_per_pair" :fields="perPairFields">
        </b-table>
      </b-card>

      <b-card header="Results per Sell-reason" class="mt-2">
        <b-table
          class="table-sm"
          :items="backtestResult.sell_reason_summary"
          :fields="perSellReason"
        >
        </b-table>
      </b-card>

      <TradeList
        class="trade-history mt-2"
        :trades="backtestResult.trades"
        profit-column="profit_percent"
      />
    </div>
  </div>
</template>

<script lang="ts">
import TradeList from '@/components/ftbot/TradeList.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { StrategyBacktestResult } from '@/types';

import { timestampms, formatPercent } from '@/shared/formatters';

@Component({
  components: { TradeList },
})
export default class BacktestResultView extends Vue {
  @Prop({ required: true }) readonly strategy!: string;

  @Prop({ required: true }) readonly backtestResult!: StrategyBacktestResult;

  get hasBacktestResult() {
    return !!this.backtestResult;
  }

  get backtestResultStats() {
    // Transpose Result into readable format
    return [
      { metric: 'Backtesting from', value: timestampms(this.backtestResult.backtest_start_ts) },
      { metric: 'Backtesting to', value: timestampms(this.backtestResult.backtest_end_ts) },
      { metric: 'Total trades', value: this.backtestResult.total_trades },
      // { metric: 'First trade', value: this.backtestResult.backtest_fi },
      // { metric: 'First trade Pair', value: this.backtestResult.backtest_best_day },
      { metric: 'Trades per day', value: this.backtestResult.trades_per_day },
      { metric: 'Best day', value: this.backtestResult.backtest_best_day },
      { metric: 'Wrost day', value: this.backtestResult.backtest_worst_day },
      { metric: 'Avg. Duration winners', value: this.backtestResult.winner_holding_avg },
      { metric: 'Avg. Duration Losers', value: this.backtestResult.loser_holding_avg },
      { metric: 'Max Drawdown', value: this.backtestResult.max_drawdown },
      { metric: 'Drawdown start', value: this.backtestResult.drawdown_start },
      { metric: 'Drawdown end', value: this.backtestResult.drawdown_end },
      { metric: 'Market change', value: this.backtestResult.market_change },
    ];
  }

  get perPairFields() {
    return [
      { key: 'key', label: 'Pair' },
      { key: 'trades', label: 'Buys' },
      { key: 'profit_mean', label: 'Avg Profit %', formatter: (value) => formatPercent(value, 2) },
      { key: 'profit_sum', label: 'Cum Profit %', formatter: (value) => formatPercent(value, 2) },
      { key: 'profit_total_abs', label: `Tot Profit ${this.backtestResult.stake_currency}` },
      {
        key: 'profit_total_pct',
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
      { key: 'profit_total_abs', label: `Tot Profit ${this.backtestResult.stake_currency}` },
      {
        key: 'profit_total_pct',
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
}
</script>

<style></style>
