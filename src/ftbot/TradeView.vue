<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-12">
            <TradeList :trades="openTrades" title="Open trades" activeTrades="True" />
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <TradeList :trades="closedtrades" title="Trade history" />
          </div>
        </div>
      </div>
      <div class="row col-md-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12">
              <BotStatus />
            </div>
            <div class="col-md-12">
              <BotControls />
            </div>
            <div class="col-md-12">
              <PerformanceView />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-7"></div>
      <div class="col-md-5">
        Bottom right
      </div>
    </div>
    <div class="row"></div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

import TradeList from './TradeList.vue';
import PerformanceView from './PerformanceView.vue';
import BotControls from './BotControls.vue';
import BotStatus from './BotStatus.vue';

export default {
  name: 'TradeView',
  components: { TradeList, PerformanceView, BotControls, BotStatus },
  created() {
    this.getTrades();
    this.getProfit();
    this.getState();
  },
  data() {
    return {
      refresh_interval: null,
    };
  },
  computed: {
    ...mapState('ftbot', ['open_trades']),
    ...mapGetters('ftbot', ['openTrades', 'closedtrades']),
  },
  methods: {
    ...mapActions(['refresh_all']),
    ...mapActions('ftbot', ['getTrades', 'getProfit', 'getState']),
  },
  mounted() {
    console.log(`Starting automatic refresh.`);
    this.refresh_interval = setInterval(() => {
      this.refresh_all();
    }, 5000);
  },
  beforeDestroy() {
    console.log(`Stopping automatic refresh.`);
    clearInterval(this.refresh_interval);
  },
};
</script>

<style></style>
