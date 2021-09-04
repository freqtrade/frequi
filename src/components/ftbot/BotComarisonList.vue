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
    <template #cell(profitClosed)="row">
      <profit-pill
        v-if="row.item.profitClosed"
        :profit-ratio="row.item.profitClosedRatio"
        :profit-abs="row.item.profitClosed"
        :stake-currency="row.item.stakeCurrency"
      />
    </template>
    <template #cell(profitOpen)="row">
      <profit-pill
        v-if="row.item.profitClosed"
        :profit-ratio="row.item.profitOpenRatio"
        :profit-abs="row.item.profitOpen"
        :stake-currency="row.item.stakeCurrency"
      />
    </template>
    <template #cell(winVsLoss)="row">
      <div v-if="row.item.losses !== undefined">
        <span class="text-profit">{{ row.item.wins }}</span> /
        <span class="text-loss">{{ row.item.losses }}</span>
      </div>
    </template>
  </b-table>
</template>

<script lang="ts">
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';
import { BotDescriptors, BotState, ProfitInterface } from '@/types';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ProfitPill from '@/components/general/ProfitPill.vue';

const ftbot = namespace('ftbot');

@Component({ components: { ProfitPill } })
export default class BotComparisonList extends Vue {
  @ftbot.Getter [MultiBotStoreGetters.allProfit]!: Record<string, ProfitInterface>;

  @ftbot.Getter [MultiBotStoreGetters.allOpenTradeCount]!: Record<string, number>;

  @ftbot.Getter [MultiBotStoreGetters.allBotState]!: Record<string, BotState>;

  @ftbot.Getter [MultiBotStoreGetters.allAvailableBots]!: BotDescriptors;

  get tableItems() {
    const val: any[] = [];
    const summary = {
      botId: 'Summary',
      profitClosed: 0,
      profitClosedRatio: undefined,
      profitOpen: 0,
      profitOpenRatio: undefined,
      stakeCurrency: 'USDT',
      wins: 0,
      losses: 0,
    };

    Object.entries(this.allProfit).forEach(([k, v]) => {
      // TODO: handle one inactive bot ...
      val.push({
        botId: this.allAvailableBots[k].botName,
        trades: `${this.allOpenTradeCount[k]} / ${this.allBotState[k]?.max_open_trades || 'N/A'}`,
        profitClosed: v.profit_closed_coin,
        profitClosedRatio: v.profit_closed_ratio_sum || 0,
        stakeCurrency: this.allBotState[k]?.stake_currency || '',
        profitOpenRatio: v.profit_all_ratio_sum - v.profit_closed_ratio_sum,
        profitOpen: v.profit_all_coin - v.profit_closed_coin,
        wins: v.winning_trades,
        losses: v.losing_trades,
      });
      if (v.profit_closed_coin !== undefined) {
        summary.profitClosed += v.profit_closed_coin;
        summary.profitOpen += v.profit_all_coin;
        summary.wins += v.winning_trades;
        summary.losses += v.losing_trades;
        // summary.decimals = this.allBotState[k]?.stake_currency_decimals || summary.decimals;
      }
    });
    val.push(summary);
    return val;
  }

  tableFields: Record<string, string | Function>[] = [
    { key: 'botId', label: 'Bot' },
    { key: 'trades', label: 'Trades' },
    { key: 'profitOpen', label: 'Open Profit' },
    { key: 'profitClosed', label: 'Closed Profit' },
    { key: 'winVsLoss', label: 'W/L' },
  ];
}
</script>

<style scoped></style>
