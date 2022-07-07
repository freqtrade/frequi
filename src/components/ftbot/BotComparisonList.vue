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
    <template #cell(botName)="row">
      <div class="d-flex flex-row">
        <b-form-checkbox
          v-if="row.item.botId && botStore.botCount > 1"
          v-model="botStore.botStores[row.item.botId].isSelected"
          title="Show bot in Dashboard"
        />
        <span>{{ row.value }}</span>
      </div>
    </template>
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
import ProfitPill from '@/components/general/ProfitPill.vue';
import { formatPrice } from '@/shared/formatters';
import { defineComponent, computed } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { ProfitInterface, ComparisonTableItems } from '@/types';

export default defineComponent({
  name: 'BotComparisonList',
  components: { ProfitPill },
  setup() {
    const botStore = useBotStore();

    const tableFields: Record<string, string | Function>[] = [
      { key: 'botName', label: 'Bot' },
      { key: 'trades', label: 'Trades' },
      { key: 'profitOpen', label: 'Open Profit' },
      { key: 'profitClosed', label: 'Closed Profit' },
      { key: 'balance', label: 'Balance' },
      { key: 'winVsLoss', label: 'W/L' },
    ];

    const tableItems = computed(() => {
      const val: ComparisonTableItems[] = [];
      const summary: ComparisonTableItems = {
        botId: undefined,
        botName: 'Summary',
        profitClosed: 0,
        profitClosedRatio: undefined,
        profitOpen: 0,
        profitOpenRatio: undefined,
        stakeCurrency: 'USDT',
        wins: 0,
        losses: 0,
      };

      Object.entries(botStore.allProfit).forEach(([k, v]: [k: string, v: ProfitInterface]) => {
        const allStakes = botStore.allOpenTrades[k].reduce((a, b) => a + b.stake_amount, 0);
        const profitOpenRatio =
          botStore.allOpenTrades[k].reduce((a, b) => a + b.profit_ratio * b.stake_amount, 0) /
          allStakes;
        const profitOpen = botStore.allOpenTrades[k].reduce((a, b) => a + (b.profit_abs ?? 0), 0);

        // TODO: handle one inactive bot ...
        val.push({
          botId: k,
          botName: botStore.availableBots[k].botName,
          trades: `${botStore.allOpenTradeCount[k]} / ${
            botStore.allBotState[k]?.max_open_trades || 'N/A'
          }`,
          profitClosed: v.profit_closed_coin,
          profitClosedRatio: v.profit_closed_ratio || 0,
          stakeCurrency: botStore.allBotState[k]?.stake_currency || '',
          profitOpenRatio,
          profitOpen,
          wins: v.winning_trades,
          losses: v.losing_trades,
          balance: botStore.allBalance[k]?.total,
          stakeCurrencyDecimals: botStore.allBotState[k]?.stake_currency_decimals || 3,
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
    });

    return {
      formatPrice,
      tableFields,
      tableItems,
      botStore,
    };
  },
});
</script>

<style scoped></style>
