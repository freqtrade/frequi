<template>
  <div class="container">
    <div class="row">
      <h2>BacktestResult for {{ strategy }}</h2>
    </div>
    <div class="container">
      <div class="row">Backtest days {{ backtestResult.backtest_days }}</div>

      <b-table class="table-sm" :items="backtestResultStats" :fields="backtestResultFields">
      </b-table>
      <TradeList class="trade-history" :trades="backtestResult.trades" />
    </div>
  </div>
</template>

<script lang="ts">
import TradeList from '@/components/ftbot/TradeList.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { StrategyBacktestResult } from '@/types';

import { timestampms } from '@/shared/formatters';

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
      { metric: 'Market chnage', value: this.backtestResult.market_change },
    ];
  }

  backtestResultFields: Array<Record<string, string>> = [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
  ];
}
</script>

<style></style>
