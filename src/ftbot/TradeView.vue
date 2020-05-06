<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-7">
        <div class="row">
          <div class="col-md-12">
            <TradeList :trades="openTrades" title="Open trades" />
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <TradeList :trades="trades" />
          </div>
        </div>
      </div>
      <div class="row col-md-5">
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
  computed: {
    ...mapState('ftbot', ['trades', 'open_trades']),
    ...mapGetters('ftbot', ['openTrades']),
  },
  methods: {
    ...mapActions('ftbot', ['getTrades', 'getProfit', 'getState']),
  },
};
</script>

<style scoped></style>
