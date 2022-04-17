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
import { defineComponent, computed, onMounted } from '@vue/composition-api';
import DailyChart from '@/components/charts/DailyChart.vue';
import { formatPrice } from '@/shared/formatters';
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'DailyStats',
  components: {
    DailyChart,
  },
  setup() {
    const { dailyStats } = useNamespacedGetters(StoreModules.ftbot, [BotStoreGetters.dailyStats]);
    const { getDaily } = useNamespacedActions(StoreModules.ftbot, ['getDaily']);
    const dailyFields = computed(() => {
      return [
        { key: 'date', label: 'Day' },
        { key: 'abs_profit', label: 'Profit', formatter: (value) => formatPrice(value) },
        {
          key: 'fiat_value',
          label: `In ${dailyStats.value.fiat_display_currency}`,
          formatter: (value) => formatPrice(value, 2),
        },
        { key: 'trade_count', label: 'Trades' },
      ];
    });
    onMounted(() => {
      getDaily();
    });

    return {
      getDaily,
      dailyFields,
      dailyStats,
    };
  },
});
</script>
