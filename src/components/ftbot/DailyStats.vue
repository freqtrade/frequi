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
import { mapActions, mapGetters } from 'vuex';
import DailyChart from '@/components/charts/DailyChart.vue';
import { formatPrice } from '@/shared/formatters';
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';

export default Vue.extend({
  name: 'DailyStats',
  components: {
    DailyChart,
  },
  computed: {
    ...mapGetters(StoreModules.ftbot, [BotStoreGetters.dailyStats]),
    dailyFields() {
      return [
        { key: 'date', label: 'Day' },
        { key: 'abs_profit', label: 'Profit', formatter: (value) => formatPrice(value) },
        {
          key: 'fiat_value',
          label: `In ${this.dailyStats.fiat_display_currency}`,
          formatter: (value) => formatPrice(value, 2),
        },
        { key: 'trade_count', label: 'Trades' },
      ];
    },
  },
  mounted() {
    this.getDaily();
  },
  methods: {
    ...mapActions(StoreModules.ftbot, ['getDaily']),
  },
});
</script>
