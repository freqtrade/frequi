<template>
  <div>
    <CandleChart> </CandleChart>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import CandleChart from '@/components/ftbot/CandleChart.vue';

export default {
  name: 'Graphs',
  components: {
    CandleChart,
  },
  mounted() {
    this.getPairHistory({ pair: 'XRP/USDT', timeframe: '5m', limit: 500 });
  },
  methods: {
    ...mapActions('ftbot', ['getPairHistory']),
  },
};
</script>

<style scoped></style>
