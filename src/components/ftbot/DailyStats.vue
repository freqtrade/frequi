<template>
  <div>
    <div class="mb-2">
      <label class="me-auto h3">Daily Stats</label>
      <b-button class="float-end" size="sm" @click="botStore.activeBot.getDaily">
        <i-mdi-refresh />
      </b-button>
    </div>
    <div class="ps-1">
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

<script setup lang="ts">
import DailyChart from '@/components/charts/DailyChart.vue';
import { formatPercent } from '@/shared/formatters';
import { useBotStore } from '@/stores/ftbotwrapper';
import { TableField } from 'bootstrap-vue-next';
import { computed, onMounted } from 'vue';

const botStore = useBotStore();
const dailyFields = computed<TableField[]>(() => {
  const res: TableField[] = [
    { key: 'date', label: 'Day' },
    {
      key: 'abs_profit',
      label: 'Profit',
      // formatter: (value: unknown) => formatPrice(value as number),
    },
    {
      key: 'fiat_value',
      label: `In ${botStore.activeBot.dailyStats.fiat_display_currency}`,
      // formatter: (value: unknown) => formatPrice(value as number, 2),
    },
    { key: 'trade_count', label: 'Trades' },
  ];
  if (botStore.activeBot.botApiVersion >= 2.16)
    res.push({
      key: 'rel_profit',
      label: 'Profit%',
      formatter: (value: unknown) => formatPercent(value as number, 2),
    });
  return res;
});
onMounted(() => {
  botStore.activeBot.getDaily();
});
</script>
