<template>
  <div>
    <div class="mb-2">
      <label class="mr-auto h3">Daily Stats</label>
      <b-button class="float-right" size="sm" @click="getDaily">&#x21bb;</b-button>
    </div>
    <div>
      <DailyChart v-if="dailyStats.data" :daily-stats="dailyStats" />
    </div>
    <div>
      <b-table class="table-sm" :items="dailyStats.data" :fields="dailyFields"> </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import DailyChart from '@/components/charts/DailyChart.vue';

export default Vue.extend({
  name: 'DailyStats',
  components: {
    DailyChart,
  },
  computed: {
    ...mapState('ftbot', ['dailyStats']),
    dailyFields() {
      return [
        { key: 'date', label: 'Day' },
        { key: 'abs_profit', label: 'Profit' },
        { key: 'fiat_value', label: `In ${this.dailyStats.fiat_display_currency}` },
        { key: 'trade_count', label: 'Trades' },
      ];
    },
  },
  mounted() {
    this.getDaily();
  },
  methods: {
    ...mapActions('ftbot', ['getDaily']),
  },
});
</script>
