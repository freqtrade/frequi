<template>
  <b-table
    ref="tradesTable"
    small
    hover
    show-empty
    primary-key="botId"
    :items="tableItems"
    :fields="tableFields"
  >
    <template #cell(profitOpen)="row">
      <profit-pill
        v-if="row.item.profitOpen && row.item.botId != 'Summary'"
        :profit-ratio="row.item.profitOpenRatio"
        :profit-abs="row.item.profitOpen"
        :stake-currency="row.item.stakeCurrency"
      />
    </template>
    <template #cell(profitClosed)="row">
      <profit-pill
        v-if="row.item.profitClosed && row.item.botId != 'Summary'"
        :profit-ratio="row.item.profitClosedRatio"
        :profit-abs="row.item.profitClosed"
        :stake-currency="row.item.stakeCurrency"
      />
    </template>

    <template #cell(balance)="row">
      <div v-if="row.item.balance">
        <span :title="row.item.stakeCurrency"
          >{{ formatPrice(row.item.balance, row.item.stakeCurrencyDecimals) }}
        </span>
        <span clas="text-small">{{ row.item.stakeCurrency }}</span>
      </div>
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
import { BalanceInterface, BotDescriptors, BotState, ProfitInterface, Trade } from '@/types';
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import ProfitPill from '@/components/general/ProfitPill.vue';
import { formatPrice } from '@/shared/formatters';

const ftbot = namespace('ftbot');

@Component({ components: { ProfitPill } })
export default class BotComparisonList extends Vue {
  @ftbot.Getter [MultiBotStoreGetters.allProfit]!: Record<string, ProfitInterface>;

  @ftbot.Getter [MultiBotStoreGetters.allOpenTradeCount]!: Record<string, number>;

  @ftbot.Getter [MultiBotStoreGetters.allOpenTrades]!: Record<string, Trade[]>;

  @ftbot.Getter [MultiBotStoreGetters.allBotState]!: Record<string, BotState>;

  @ftbot.Getter [MultiBotStoreGetters.allBalance]!: Record<string, BalanceInterface>;

  @ftbot.Getter [MultiBotStoreGetters.allAvailableBots]!: BotDescriptors;

  formatPrice = formatPrice;

  get tableItems() {
    console.log('tableItems called');
    const val: any[] = [];
    const summary = {
      botId: 'Summary',
      profitClosed: 0,
      profitClosedRatio: 0,
      profitOpen: 0,
      profitOpenRatio: 0,
      stakeCurrency: 'USDT',
      wins: 0,
      losses: 0,
    };

    Object.entries(this.allProfit).forEach(([k, v]) => {
      const allStakes = this.allOpenTrades[k].reduce((a, b) => a + b.stake_amount, 0);
      const profitOpenRatio =
        this.allOpenTrades[k].reduce((a, b) => a + b.profit_ratio * b.stake_amount, 0) / allStakes;
      const profitOpen = this.allOpenTrades[k].reduce((a, b) => a + b.profit_abs, 0);

      // TODO: handle one inactive bot ...
      val.push({
        botId: this.allAvailableBots[k].botName,
        trades: `${this.allOpenTradeCount[k]} / ${this.allBotState[k]?.max_open_trades || 'N/A'}`,
        profitClosed: v.profit_closed_coin,
        profitClosedRatio: v.profit_closed_ratio_sum || 0,
        stakeCurrency: this.allBotState[k]?.stake_currency || '',
        profitOpenRatio,
        profitOpen,
        wins: v.winning_trades,
        losses: v.losing_trades,
        balance: this.allBalance[k]?.total,
        stakeCurrencyDecimals: this.allBotState[k]?.stake_currency_decimals || 3,
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
    { key: 'balance', label: 'Balance' },
    { key: 'winVsLoss', label: 'W/L' },
  ];
}
</script>

<style scoped></style>
