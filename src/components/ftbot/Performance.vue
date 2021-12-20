<template>
  <div>
    <div class="mb-2">
      <h3>Performance</h3>
    </div>
    <b-table class="table-sm" :items="performanceStats" :fields="tableFields"></b-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { BotState, PerformanceEntry } from '@/types';
import { formatPrice } from '@/shared/formatters';
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);

@Component({})
export default class Performance extends Vue {
  // TODO: Verify type of PerformanceStats!
  @ftbot.Getter [BotStoreGetters.performanceStats]!: PerformanceEntry[];

  @ftbot.Getter [BotStoreGetters.botState]?: BotState;

  get tableFields() {
    return [
      { key: 'pair', label: 'Pair' },
      { key: 'profit', label: 'Profit %' },
      {
        key: 'profit_abs',
        label: `Profit ${this.botState?.stake_currency}`,
        formatter: (v: number) => formatPrice(v, 5),
      },
      { key: 'count', label: 'Count' },
    ];
  }
}
</script>
