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
import { formatPrice } from '@/shared/formatters';
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import { BotDescriptors, BotState, ProfitInterface } from '@/types';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const ftbot = namespace('ftbot');

@Component({})
export default class BotComparisonList extends Vue {
  @ftbot.Getter [MultiBotStoreGetters.allProfit]!: Record<string, ProfitInterface>;

  @ftbot.Getter [MultiBotStoreGetters.allOpenTradeCount]!: Record<string, number>;

  @ftbot.Getter [MultiBotStoreGetters.allBotState]!: Record<string, BotState>;

  @ftbot.Getter [MultiBotStoreGetters.allAvailableBots]!: BotDescriptors;

  get tableItems() {
    const val: any[] = [];
    let closedSum = 0;
    let openProfitSum = 0;
    let decimals = 3;
    Object.entries(this.allProfit).forEach(([k, v]) => {
      // TODO: handle one inactive bot ...
      val.push({
        botId: this.allAvailableBots[k].botName,
        trades: `${this.allOpenTradeCount[k]} / ${this.allBotState[k]?.max_open_trades}`,
        profitClosed: `${
          formatPrice(v.profit_closed_coin, this.allBotState[k]?.stake_currency_decimals) || 'N/A'
        } `,
        profitClosedPercent: `${v.profit_closed_percent_sum || 'N/A'}`,
        profitOpenPercent: v.profit_all_percent_sum,
        profitOpen: v.profit_all_coin,
        winVsLoss: `${v.winning_trades || 'N/A'} / ${v.losing_trades || 'N/A'}`,
      });
      if (v.profit_closed_coin !== undefined) {
        closedSum += v.profit_closed_coin;
        openProfitSum += v.profit_all_coin;
        decimals = this.allBotState[k]?.stake_currency_decimals || decimals;
      }
    });
    val.push({
      botId: 'Summary',
      profitClosed: formatPrice(closedSum, decimals),
      profitClosedPercent: '',
      profitOpenPercent: '',
      profitOpen: '',
      winVsLoss: '',
    });
    return val;
  }

  tableFields: Record<string, string | Function>[] = [
    { key: 'botId', label: 'Bot' },
    { key: 'trades', label: 'Trades' },
    { key: 'profitClosed', label: 'Closed Profit' },
    { key: 'profitClosedPercent', label: 'Closed Profit %' },
    { key: 'winVsLoss', label: 'W/L' },
  ];
}
</script>

<style scoped></style>
