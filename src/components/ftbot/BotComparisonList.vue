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
    <template #cell(botName)="{ item, value }">
      <div class="d-flex flex-row">
        <b-form-checkbox
          v-if="item.botId && botStore.botCount > 1"
          v-model="
            botStore.botStores[(item as unknown as ComparisonTableItems).botId ?? ''].isSelected
          "
          title="Show this bot in Dashboard"
          >{{ value }}</b-form-checkbox
        >
        <b-form-checkbox
          v-if="!item.botId && botStore.botCount > 1"
          v-model="allToggled"
          title="Toggle all bots"
          >{{ value }}</b-form-checkbox
        >
      </div>
    </template>
    <template #cell(profitOpen)="{ item }">
      <profit-pill
        v-if="item.profitOpen && item.botId != 'Summary'"
        :profit-ratio="(item as unknown as ComparisonTableItems).profitOpenRatio"
        :profit-abs="(item as unknown as ComparisonTableItems).profitOpen"
        :stake-currency="(item as unknown as ComparisonTableItems).stakeCurrency"
      />
    </template>
    <template #cell(profitClosed)="{ item }">
      <profit-pill
        v-if="item.profitClosed && item.botId != 'Summary'"
        :profit-ratio="(item as unknown as ComparisonTableItems).profitClosedRatio"
        :profit-abs="(item as unknown as ComparisonTableItems).profitClosed"
        :stake-currency="(item as unknown as ComparisonTableItems).stakeCurrency"
      />
    </template>

    <template #cell(balance)="{ item }">
      <div v-if="item.balance">
        <span :title="(item as unknown as ComparisonTableItems).stakeCurrency"
          >{{
            formatPrice(
              (item as unknown as ComparisonTableItems).balance ?? 0,
              (item as unknown as ComparisonTableItems).stakeCurrencyDecimals,
            )
          }}
        </span>
        <span class="text-small">{{
          ` ${item.stakeCurrency}${item.isDryRun ? ' (dry)' : ''}`
        }}</span>
      </div>
    </template>
    <template #cell(winVsLoss)="{ item }">
      <div v-if="item.losses !== undefined">
        <span class="text-profit">{{ item.wins }}</span> /
        <span class="text-loss">{{ item.losses }}</span>
      </div>
    </template>
  </b-table>
</template>

<script setup lang="ts">
import ProfitPill from '@/components/general/ProfitPill.vue';
import { formatPrice } from '@/shared/formatters';
import { computed } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { ProfitInterface, ComparisonTableItems } from '@/types';
import { TableField, TableItem } from 'bootstrap-vue-next';

const botStore = useBotStore();

const allToggled = computed<boolean>({
  get: () => Object.values(botStore.botStores).every((i) => i.isSelected),
  set: (val) => {
    for (const botId in botStore.botStores) {
      botStore.botStores[botId].isSelected = val;
    }
  },
});

const tableFields: TableField[] = [
  { key: 'botName', label: 'Bot' },
  { key: 'trades', label: 'Trades' },
  { key: 'profitOpen', label: 'Open Profit' },
  { key: 'profitClosed', label: 'Closed Profit' },
  { key: 'balance', label: 'Balance' },
  { key: 'winVsLoss', label: 'W/L' },
];

const tableItems = computed<TableItem[]>(() => {
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
      botStore.allOpenTrades[k].reduce(
        (a, b) => a + (b.total_profit_ratio ?? b.profit_ratio) * b.stake_amount,
        0,
      ) / allStakes;
    const profitOpen = botStore.allOpenTrades[k].reduce(
      (a, b) => a + (b.total_profit_abs ?? b.profit_abs ?? 0),
      0,
    );

    // TODO: handle one inactive bot ...
    val.push({
      botId: k,
      botName: botStore.availableBots[k].botName || botStore.availableBots[k].botId,
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
      balance: botStore.allBalance[k]?.total_bot ?? botStore.allBalance[k]?.total,
      stakeCurrencyDecimals: botStore.allBotState[k]?.stake_currency_decimals || 3,
      isDryRun: botStore.allBotState[k]?.dry_run,
    });
    if (v.profit_closed_coin !== undefined) {
      if (botStore.botStores[k].isSelected) {
        // Summary should only include selected bots
        summary.profitClosed += v.profit_closed_coin;
        summary.profitOpen += profitOpen;
        summary.wins += v.winning_trades;
        summary.losses += v.losing_trades;
        // summary.decimals = this.allBotState[k]?.stake_currency_decimals || summary.decimals;
        // This will always take the last bot's stake currency
        // And therefore may result in wrong values.
        summary.stakeCurrency = botStore.allBotState[k]?.stake_currency || summary.stakeCurrency;
      }
    }
  });
  val.push(summary);
  return val as unknown as TableItem[];
});
</script>

<style scoped></style>
