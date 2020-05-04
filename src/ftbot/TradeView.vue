<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm">Top left</div>
      <div class="col-sm">Performance</div>
    </div>
    <div class="row">
      <div class="col-md-7"><TradeList :trades="openTrades" title="Open trades" /></div>
      <div class="col-md-5">
        Bottom right
      </div>
    </div>
    <div class="row">
      <TradeList :trades="trades" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

import TradeList from './TradeList.vue';

export default {
  name: 'TradeView',
  components: { TradeList },
  created() {
    this.ping();
    this.getTrades();
  },
  computed: {
    ...mapState('ftbot', ['trades', 'open_trades']),
    ...mapGetters('ftbot', ['openTrades']),
  },
  methods: {
    ...mapActions('ftbot', ['getTrades']),
    ...mapActions(['ping']),
  },
};
</script>

<style scoped></style>
