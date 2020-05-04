<template>
  <div class=".container-fluid">
    <div class="row">
      <div class="col-sm">Top left</div>
      <div class="col-sm">Performance</div>
    </div>
    <div class="row">
      <div class="col-sm">Bottom left</div>
      <div class="col-sm">Bottom right</div>
    </div>
    <div class="row">
      <TradeList v-if="trades" :trades="trades" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import TradeList from './TradeList.vue';

export default {
  name: 'TradeView',
  components: { TradeList },
  created() {
    this.ping();
    this.getTrades();
  },
  computed: {
    ...mapState('trades', ['trades']),
  },
  methods: {
    ...mapActions('trades', ['getTrades']),
    ...mapActions(['ping']),
  },
};
</script>

<style scoped></style>
