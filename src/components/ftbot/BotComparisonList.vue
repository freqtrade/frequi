<script setup lang="ts">
import type { ComparisonTableItems } from '@/types';
import type { TableColumn } from '@nuxt/ui';

const botStore = useBotStore();

const allToggled = computed<boolean>({
  get: () => Object.values(botStore.botStores).every((i) => i.isSelected),
  set: (val) => {
    for (const bot of Object.values(botStore.botStores)) {
      bot.isSelected = val;
    }
  },
});

const tableItems = computed<ComparisonTableItems[]>(() => {
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
    balance: 0,
    balanceAppendix: '',
  };
  Object.entries(botStore.allProfit).forEach(([k, v]) => {
    const thisBotStore = botStore.botStores[k];
    if (!thisBotStore) return;

    const allOpenTrades = botStore.allOpenTrades[k];
    if (!allOpenTrades) return;
    const allStakes = allOpenTrades.reduce((a, b) => a + b.stake_amount, 0);
    const profitOpenRatio =
      allOpenTrades.reduce(
        (a, b) => a + (b.total_profit_ratio ?? b.profit_ratio ?? 0) * b.stake_amount,
        0,
      ) / allStakes;
    const profitOpen = allOpenTrades.reduce(
      (a, b) => a + (b.total_profit_abs ?? b.profit_abs ?? 0),
      0,
    );

    // TODO: handle one inactive bot ...
    val.push({
      botId: k,
      // botName:
      //   `${thisBotStore.botName} - ${botStore.availableBots[k].botName}` || thisBotStore.botId,

      botName: thisBotStore.uiBotName || thisBotStore.botId,
      trades: `${botStore.allOpenTradeCount[k]} / ${
        botStore.allBotState[k]?.max_open_trades || 'N/A'
      }`,
      profitClosed: v?.profit_closed_coin ?? 0,
      profitClosedRatio: v?.profit_closed_ratio || 0,
      stakeCurrency: botStore.allBotState[k]?.stake_currency || '',
      profitOpenRatio,
      profitOpen,
      wins: v?.winning_trades ?? 0,
      losses: v?.losing_trades ?? 0,
      balance: botStore.allBalance[k]?.total_bot ?? botStore.allBalance[k]?.total ?? 0,
      stakeCurrencyDecimals: botStore.allBotState[k]?.stake_currency_decimals || 3,
      isDryRun: botStore.allBotState[k]?.dry_run,
      isOnline: botStore.botStores[k]?.isBotOnline,
      balanceAppendix: botStore.allBotState[k]?.dry_run ? '(dry)' : '',
    });
    if (v?.profit_closed_coin !== undefined) {
      if (thisBotStore.isSelected) {
        // Summary should only include selected bots
        summary.profitClosed += v.profit_closed_coin;
        summary.profitOpen += profitOpen;
        summary.wins += v.winning_trades;
        summary.losses += v.losing_trades;
        if (botStore.allSelectedBotsSameStake) {
          summary.balance +=
            botStore.allBalance[k]?.total_bot ?? botStore.allBalance[k]?.total ?? 0;
          summary.stakeCurrencyDecimals = botStore.allBotState[k]?.stake_currency_decimals || 3;
          if (botStore.allSelectedBotsSameState) {
            summary.balanceAppendix = botStore.allBotState[k]?.dry_run ? '(dry)' : '(live)';
          } else {
            summary.balanceAppendix = '(mixed dry and live)';
          }
        }
        // summary.decimals = this.allBotState[k]?.stake_currency_decimals || summary.decimals;
        // This will always take the last bot's stake currency
        // And therefore may result in wrong values.
        summary.stakeCurrency = botStore.allBotState[k]?.stake_currency || summary.stakeCurrency;
      }
    }
  });
  val.push(summary);
  return val;
});

const columns: TableColumn<ComparisonTableItems>[] = [
  { accessorKey: 'botName' },
  { accessorKey: 'trades', header: 'Trades' },
  { id: 'profitOpen', header: 'Open Profit' },
  { id: 'profitClosed', header: 'Closed Profit' },
  { accessorKey: 'balance', header: 'Balance' },
  { id: 'winVsLoss', header: 'W/L' },
];
</script>

<template>
  <UTable :data="tableItems" :columns="columns">
    <template #botName-header>
      <div class="flex justify-between flex-row w-full">
        <b>Bot Name</b
        ><UBadge
          class="items-center text-slate-200 bg-slate-800 cursor-pointer"
          color="neutral"
          title="Click to select all bots"
          @click="botStore.toggleBotsByState('all')"
          >All</UBadge
        >
      </div>
    </template>
    <template #botName-cell="{ row }">
      <div class="flex flex-row justify-between items-center">
        <div>
          <BaseCheckbox
            v-if="row.original.botId && botStore.botCount > 1"
            v-model="
              botStore.botStores[(row.original as unknown as ComparisonTableItems).botId!]!
                .isSelected
            "
            title="Show this bot in Dashboard"
            >{{ row.original.botName }}</BaseCheckbox
          >
          <BaseCheckbox
            v-if="!row.original.botId && botStore.botCount > 1"
            v-model="allToggled"
            title="Toggle all bots"
            class="font-bold"
            >{{ row.original.botName }}</BaseCheckbox
          >
          <span v-if="botStore.botCount <= 1">{{ row.original.botName }}</span>
        </div>
        <UBadge
          v-if="row.original.isOnline && row.original.isDryRun"
          class="items-center bg-green-800 text-slate-200 cursor-pointer"
          color="success"
          title="Click to select all dry run bots"
          @click="botStore.toggleBotsByState('dry')"
          >Dry</UBadge
        >
        <UBadge
          v-if="row.original.isOnline && !row.original.isDryRun"
          class="items-center cursor-pointer"
          color="warning"
          title="Click to select all live bots"
          @click="botStore.toggleBotsByState('live')"
          >Live</UBadge
        >
        <UBadge v-if="row.original.isOnline === false" class="items-center" color="neutral"
          >Offline</UBadge
        >
      </div>
    </template>
    <template #profitOpen-cell="{ row }">
      <ProfitPill
        v-if="row.original.profitOpen && row.original.botId !== 'Summary'"
        :profit-ratio="row.original.profitOpenRatio"
        :profit-abs="row.original.profitOpen"
        :profit-desc="`Total Profit (Open and realized) ${formatPercent(
          row.original.profitOpenRatio ?? 0.0,
        )}`"
        :stake-currency="row.original.stakeCurrency"
      />
    </template>
    <template #profitClosed-cell="{ row }">
      <ProfitPill
        v-if="row.original.profitClosed && row.original.botId !== 'Summary'"
        :profit-ratio="row.original.profitClosedRatio"
        :profit-abs="row.original.profitClosed"
        :stake-currency="row.original.stakeCurrency"
      />
    </template>
    <template #balance-cell="{ row }">
      <div v-if="row.original.balance">
        <span :title="row.original.stakeCurrency"
          >{{ formatPrice(row.original.balance ?? 0, row.original.stakeCurrencyDecimals) }}
        </span>
        <span class="text-sm">{{
          ` ${row.original.stakeCurrency}${row.original.balanceAppendix}`
        }}</span>
      </div>
    </template>
    <template #winVsLoss-cell="{ row }">
      <div v-if="row.original.losses !== undefined">
        <span class="text-profit">{{ row.original.wins }}</span> /
        <span class="text-loss">{{ row.original.losses }}</span>
      </div>
    </template>
  </UTable>
</template>
