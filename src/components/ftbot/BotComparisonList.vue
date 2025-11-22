<script setup lang="ts">
import type { ComparisonTableItems } from '@/types';

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
</script>

<template>
  <DataTable size="small" :value="tableItems">
    <Column field="botName">
      <template #header>
        <div class="flex justify-between flex-row w-full">
          <b>Bot Name</b
          ><Badge
            class="items-center text-slate-200 bg-slate-800 cursor-pointer"
            severity="contrast"
            title="Click to select all bots"
            @click="botStore.toggleBotsByState('all')"
            >All</Badge
          >
        </div>
      </template>
      <template #body="{ data, field }">
        <div class="flex flex-row justify-between items-center">
          <div>
            <BaseCheckbox
              v-if="data.botId && botStore.botCount > 1"
              v-model="
                botStore.botStores[(data as unknown as ComparisonTableItems).botId!]!.isSelected
              "
              title="Show this bot in Dashboard"
              >{{ data[field] }}</BaseCheckbox
            >
            <BaseCheckbox
              v-if="!data.botId && botStore.botCount > 1"
              v-model="allToggled"
              title="Toggle all bots"
              class="font-bold"
              >{{ data[field] }}</BaseCheckbox
            >
            <span v-if="botStore.botCount <= 1">{{ data[field] }}</span>
          </div>
          <Badge
            v-if="data.isOnline && data.isDryRun"
            class="items-center bg-green-800 text-slate-200 cursor-pointer"
            severity="success"
            title="Click to select all dry run bots"
            @click="botStore.toggleBotsByState('dry')"
            >Dry</Badge
          >
          <Badge
            v-if="data.isOnline && !data.isDryRun"
            class="items-center cursor-pointer"
            severity="warning"
            title="Click to select all live bots"
            @click="botStore.toggleBotsByState('live')"
            >Live</Badge
          >
          <Badge v-if="data.isOnline === false" class="items-center" severity="secondary"
            >Offline</Badge
          >
        </div>
      </template>
    </Column>
    <Column field="trades" header="Trades"> </Column>
    <Column header="Open Profit">
      <template #body="{ data }">
        <ProfitPill
          v-if="data.profitOpen && data.botId != 'Summary'"
          :profit-ratio="(data as unknown as ComparisonTableItems).profitOpenRatio"
          :profit-abs="(data as unknown as ComparisonTableItems).profitOpen"
          :profit-desc="`Total Profit (Open and realized) ${formatPercent(
            (data as ComparisonTableItems).profitOpenRatio ?? 0.0,
          )}`"
          :stake-currency="(data as ComparisonTableItems).stakeCurrency"
        />
      </template>
    </Column>
    <Column header="Closed Profit">
      <template #body="{ data }">
        <ProfitPill
          v-if="data.profitClosed && data.botId != 'Summary'"
          :profit-ratio="(data as ComparisonTableItems).profitClosedRatio"
          :profit-abs="(data as ComparisonTableItems).profitClosed"
          :stake-currency="(data as unknown as ComparisonTableItems).stakeCurrency"
        />
      </template>
    </Column>
    <Column field="balance" header="Balance">
      <template #body="{ data }">
        <div v-if="data.balance">
          <span :title="(data as ComparisonTableItems).stakeCurrency"
            >{{
              formatPrice(
                (data as ComparisonTableItems).balance ?? 0,
                (data as ComparisonTableItems).stakeCurrencyDecimals,
              )
            }}
          </span>
          <span class="text-sm">{{ ` ${data.stakeCurrency}${data.balanceAppendix}` }}</span>
        </div>
      </template>
    </Column>
    <Column field="winVsLoss" header="W/L">
      <template #body="{ data }">
        <div v-if="data.losses !== undefined">
          <span class="text-profit">{{ data.wins }}</span> /
          <span class="text-loss">{{ data.losses }}</span>
        </div>
      </template>
    </Column>
  </DataTable>
</template>
