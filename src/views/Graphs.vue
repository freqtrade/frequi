<template>
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-mb-2">
        <b-form-select :options="whitelist" v-model="pair" @change="refresh"> </b-form-select>
      </div>
      <div class="col-mb-2"></div>
    </div>
    <div class="row">
      <CandleChart :pair="pair" :timeframe="timeframe"> </CandleChart>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import CandleChart from '@/components/ftbot/CandleChart.vue';

export default {
  name: 'Graphs',
  components: {
    CandleChart,
  },
  data() {
    return {
      pair: 'XRP/USDT',
      timeframe: '5m',
    };
  },
  computed: {
    ...mapState('ftbot', ['whitelist']),
  },
  mounted() {
    this.getWhitelist();
    this.refresh();
  },
  methods: {
    ...mapActions('ftbot', ['getPairHistory', 'getWhitelist']),
    refresh() {
      this.getPairHistory({ pair: this.pair, timeframe: this.timeframe, limit: 500 });
    },
  },
};
</script>

<style scoped></style>
