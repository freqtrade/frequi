<template>
  <div class="container-fluid">
    <div class="row">
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
      <div class="row col-md-4">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-12">
              <BotControls />
            </div>
            <div class="col-md-12">
              <b-tabs content-class="mt-3" class="mt-5">
                <b-tab title="Performance" active>
                  <Performance class="performance-view" />
                </b-tab>
                <b-tab title="Status">
                  <BotStatus />
                </b-tab>
                <b-tab title="Whitelist"> </b-tab>
              </b-tabs>
            </div>
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

export default {
  name: 'TradeView',
  components: { TradeList, Performance, BotControls, BotStatus },
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
