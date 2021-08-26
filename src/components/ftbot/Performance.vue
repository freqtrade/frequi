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

const ftbot = namespace('ftbot');

@Component({})
export default class Performance extends Vue {
  @ftbot.State performanceStats!: PerformanceEntry[];

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
