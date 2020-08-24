<template>
  <div>
    <div>
      <b-card-group deck>
        <b-card header="Open / Total trades">
          <b-card-text>
            <span class="text-primary">{{ openTrades.length }}</span> /
            <span class="text-secondary">{{ profit.trade_count }}</span>
          </b-card-text>
        </b-card>
        <b-card header="Won / lost trades">
          <b-card-text>
            <span class="text-success">{{ profit.winning_trades }}</span> /
            <span class="text-danger">{{ profit.losing_trades }}</span>
          </b-card-text>
        </b-card>
        <b-card header="Last trade">
          <b-card-text>{{ profit.latest_trade_date }} {{ ftbot }}</b-card-text>
        </b-card>
      </b-card-group>
    </div>
    <div class="mt-3">
      <b-card-group deck>
        <b-card header="Best performing">
          <b-card-text>{{ profit.best_pair }}</b-card-text>
        </b-card>
        <b-card header="Total Balance">
          <b-card-text
            >{{ formatPrice(balance.total) }} {{ dailyStats.stake_currency }}</b-card-text
          >
        </b-card>
        <b-card v-if="profit.profit_closed_fiat" header="Total profit">
          <b-card-text
            >{{ formatPrice(profit.profit_closed_fiat) }}
            {{ dailyStats.fiat_display_currency }}</b-card-text
          >
        </b-card>
      </b-card-group>
    </div>
    <div class="mt-3">
      <DailyChart v-if="dailyStats.data" :daily-stats="dailyStats" />
      <CumProfitChart :trades="closedTrades" />
      <HourlyChart :trades="closedTrades" />
    </div>
  </div>
</template>

<script lang="ts">
import { formatPrice } from '@/shared/formatters';

import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

import DailyChart from '@/components/charts/DailyChart.vue';
import HourlyChart from '@/components/charts/HourlyChart.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';

import { Trade, DailyReturnValue, BalanceInterface } from '@/types';

const ftbot = namespace('ftbot');

@Component({
  components: {
    DailyChart,
    HourlyChart,
    CumProfitChart,
  },
})
export default class Trading extends Vue {
  @ftbot.Getter closedTrades!: Trade[];

  @ftbot.State dailyStats!: DailyReturnValue;

  @ftbot.Getter openTrades!: Array<Trade>;

  @ftbot.State balance!: BalanceInterface;

  @ftbot.State profit!: BalanceInterface;

  @ftbot.State performanceStats!: Array<PerformanceEntry>;

  @ftbot.Action getPerformance;

  @ftbot.Action getDaily;

  @ftbot.Action getTrades;

  @ftbot.Action getOpenTrades;

  @ftbot.Action getBalance;

  @ftbot.Action getProfit;

  formatPrice = formatPrice;

  mounted() {
    this.getDaily();
    this.getTrades();
    this.getOpenTrades();
    this.getBalance();
    this.getPerformance();
    this.getProfit();
  }
}
</script>

<style scoped></style>
