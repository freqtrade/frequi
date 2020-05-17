<template>
  <div class="card">
    <div class="card-header">
      <label class="mr-auto">Daily Stats</label>
      <b-button class="float-right" size="sm" @click="getDaily">R</b-button>
    </div>
    <div class="card-body">
      <b-table class="table-sm" :items="dailyStats.data" :fields="daily_fields"> </b-table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'DailyStats',
  computed: {
    ...mapState('ftbot', ['dailyStats']),
    daily_fields() {
      return [
        { key: 'date', label: 'Day' },
        { key: 'abs_profit', label: 'Profit' },
        { key: 'fiat_value', label: `In ${this.dailyStats.fiat_display_currency}` },
        { key: 'trade_count', label: 'Trades' },
      ];
    },
  },
  methods: {
    ...mapActions('ftbot', ['getDaily']),
  },
  mounted() {
    this.getDaily();
  },
};
</script>
