<template>
  <b-table
    ref="tradesTable"
    small
    hover
    stacked="md"
    show-empty
    primary-key="botId"
    :items="tableItems"
    :fields="tableFields"
  >
  </b-table>
</template>

<script lang="ts">
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import { BotDescriptors, ProfitInterface } from '@/types';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ftbot = namespace('ftbot');

@Component({})
export default class BotComparisonList extends Vue {
  @ftbot.Getter [MultiBotStoreGetters.allProfit]!: Record<string, ProfitInterface>;

  @ftbot.Getter [MultiBotStoreGetters.allAvailableBots]!: BotDescriptors;

  get tableItems() {
    const val: any[] = [];
    Object.entries(this.allProfit).forEach(([k, v]) => {
      // TODO: handle one inactive bot ...
      val.push({
        botId: this.allAvailableBots[k].botName,
        profitClosed: `${v.profit_closed_coin || 'N/A'} `,
        profitClosedPercent: `${v.profit_closed_percent_sum || 'N/A'} %`,
        profitOpenPercent: v.profit_all_percent_sum,
        profitOpen: v.profit_all_coin,
        winVsLoss: `${v.winning_trades || 'N/A'} / ${v.losing_trades || 'N/A'}`,
      });
    });
    return val;
  }

  tableFields: Record<string, string | Function>[] = [
    { key: 'botId', label: 'ID' },
    { key: 'profitClosed', label: 'Closed Profit' },
    { key: 'profitClosedPercent', label: 'Closed Profit %' },
    { key: 'winVsLoss', label: 'W/L' },
  ];
}
</script>

<style scoped></style>
