<template>
  <div>
    <div class="mb-2">
      <h3>Performance</h3>
    </div>
    <b-table class="table-sm" :items="performanceStats" :fields="tableFields"></b-table>
  </div>
</template>

<script lang="ts">
import { formatPrice } from '@/shared/formatters';
import { BotStoreGetters } from '@/store/modules/ftbot';
import { defineComponent, computed } from '@vue/composition-api';
import { useNamespacedGetters } from 'vuex-composition-helpers';
import StoreModules from '@/store/storeSubModules';

export default defineComponent({
  name: 'Performance',
  setup() {
    const { performanceStats, botState } = useNamespacedGetters(StoreModules.ftbot, [
      BotStoreGetters.performanceStats,
      BotStoreGetters.botState,
    ]);
    const tableFields = computed(() => {
      return [
        { key: 'pair', label: 'Pair' },
        { key: 'profit', label: 'Profit %' },
        {
          key: 'profit_abs',
          label: `Profit ${botState.value?.stake_currency}`,
          formatter: (v: number) => formatPrice(v, 5),
        },
        { key: 'count', label: 'Count' },
      ];
    });
    return {
      performanceStats,
      botState,
      tableFields,
    };
  },
});
</script>
