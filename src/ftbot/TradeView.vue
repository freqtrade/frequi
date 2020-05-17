<template>
  <div class="container-fluid">
    <div class="row">
      <div class="row col-md-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12">
              <b-form-checkbox v-model="autoRefresh" size="lg" switch>AutoRefresh</b-form-checkbox>
              <BotControls class="mt-3" />
            </div>
            <div class="col-md-12">
              <b-tabs content-class="mt-3" class="mt-3">
                <b-tab title="Status" active>
                  <BotStatus />
                </b-tab>
                <b-tab title="Performance">
                  <Performance class="performance-view" />
                </b-tab>
                <b-tab title="Balance" lazy>
                  <Balance />
                </b-tab>
                <b-tab title="Daily Stats" lazy>
                  <DailyStats />
                </b-tab>

                <b-tab title="Whitelist"> </b-tab>
              </b-tabs>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-12">
            <TradeList
              class="open-trades"
              :trades="openTrades"
              title="Open trades"
              v-bind:activeTrades="true"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <TradeList class="trade-history" :trades="closedtrades" title="Trade history" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

import TradeList from './TradeList.vue';
import Performance from './Performance.vue';
import BotControls from './BotControls.vue';
import BotStatus from './BotStatus.vue';
import Balance from './Balance.vue';
import DailyStats from './DailyStats.vue';

export default {
  name: 'TradeView',
  components: { TradeList, Performance, BotControls, BotStatus, Balance, DailyStats },
  created() {
    this.refreshAll();
  },
  data() {
    return {
      autoRefresh: true,
      refresh_interval: null,
      refresh_interval_slow: null,
    };
  },
  computed: {
    ...mapState('ftbot', ['open_trades']),
    ...mapGetters('ftbot', ['openTrades', 'closedtrades']),
  },
  methods: {
    ...mapActions(['refreshSlow', 'refreshFrequent', 'refreshAll']),
    // ...mapActions('ftbot', ['getTrades', 'getProfit', 'getState']),
    startRefresh() {
      console.log(`Starting automatic refresh.`);
      this.refreshFrequent();
      this.refresh_interval = setInterval(() => {
        this.refreshFrequent();
      }, 5000);
      this.refreshSlow();
      this.refresh_interval_slow = setInterval(() => {
        this.refreshSlow();
      }, 60000);
    },
    stopRefresh() {
      console.log(`Stopping automatic refresh.`);
      clearInterval(this.refresh_interval);
      clearInterval(this.refresh_interval_slow);
    },
  },
  mounted() {
    this.startRefresh();
  },
  beforeDestroy() {
    this.stopRefresh();
  },
  watch: {
    autoRefresh(val) {
      if (val) {
        this.startRefresh();
      } else {
        this.stopRefresh();
      }
    },
  },
};
</script>

<style scoped>
.open-trades {
  max-height: 300px;
  min-height: 250px;
}
.trade-history {
  min-height: 300px;
  max-height: 500px;
}
.performance-view {
  max-height: 500px;
}
</style>
