<template>
  <div>
    <div class="mb-2">
      <h3>Performance</h3>
    </div>
    <b-table
      class="table-sm"
      :items="botStore.activeBot.performanceStats"
      :fields="tableFields"
    ></b-table>
  </div>
</template>

<script lang="ts">
import { formatPrice } from '@/shared/formatters';
import { defineComponent, computed } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'Performance',
  setup() {
    const botStore = useBotStore();
    const tableFields = computed(() => {
      return [
        { key: 'pair', label: 'Pair' },
        { key: 'profit', label: 'Profit %' },
        {
          key: 'profit_abs',
          label: `Profit ${botStore.activeBot.botState?.stake_currency}`,
          formatter: (v: number) => formatPrice(v, 5),
        },
        { key: 'count', label: 'Count' },
      ];
    });
    return {
      tableFields,
      botStore,
    };
  },
});
</script>
