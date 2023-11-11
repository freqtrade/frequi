<script setup lang="ts">
import { formatPrice } from '@/shared/formatters';
import { computed } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { TableField } from 'bootstrap-vue-next';

const botStore = useBotStore();
const tableFields = computed<TableField[]>(() => {
  return [
    { key: 'pair', label: 'Pair' },
    { key: 'profit', label: 'Profit %' },
    {
      key: 'profit_abs',
      label: `Profit ${botStore.activeBot.botState?.stake_currency}`,
      formatter: (v: unknown) => formatPrice(v as number, 5),
    },
    { key: 'count', label: 'Count' },
  ];
});

function refreshSummary() {
  botStore.activeBot.getPerformance();
}
</script>
<template>
  <div>
    <div class="mb-2">
      <h3 class="me-auto d-inline">Performance</h3>
      <b-button class="float-end" size="sm" @click="refreshSummary">
        <i-mdi-refresh />
      </b-button>
    </div>
    <b-table
      class="table-sm"
      :items="botStore.activeBot.performanceStats"
      :fields="tableFields"
    ></b-table>
  </div>
</template>
