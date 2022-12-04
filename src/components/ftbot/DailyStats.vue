<template>
  <div>
    <div class="mb-2">
      <label class="me-auto h3">Daily Stats</label>
      <b-button class="float-end" size="sm" @click="botStore.activeBot.getDaily">&#x21bb;</b-button>
    </div>
    <div>
      <DailyChart
        v-if="botStore.activeBot.dailyStats.data"
        :daily-stats="botStore.activeBot.dailyStatsSorted"
      />
    </div>
    <div>
      <b-table class="table-sm" :items="botStore.activeBot.dailyStats.data" :fields="dailyFields">
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import DailyChart from '@/components/charts/DailyChart.vue';
import { formatPercent, formatPrice } from '@/shared/formatters';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'DailyStats',
  components: {
    DailyChart,
  },
  setup() {
    const botStore = useBotStore();
    const dailyFields = computed(() => {
      return [
        { key: 'date', label: 'Day' },
        { key: 'abs_profit', label: 'Profit', formatter: (value) => formatPrice(value) },
        {
          key: 'fiat_value',
          label: `In ${botStore.activeBot.dailyStats.fiat_display_currency}`,
          formatter: (value) => formatPrice(value, 2),
        },
        { key: 'trade_count', label: 'Trades' },
        botStore.activeBot.botApiVersion >= 2.16
          ? { key: 'rel_profit', label: 'Profit%', formatter: (value) => formatPercent(value, 2) }
          : null,
      ];
    });
    onMounted(() => {
      botStore.activeBot.getDaily();
    });

    return {
      botStore,
      dailyFields,
    };
  },
});
</script>
