<template>
  <b-table
    v-if="botStore.activeBot.profit"
    small
    borderless
    :items="profitItems"
    :fields="profitFields"
  >
  </b-table>
</template>

<script setup lang="ts">
import { formatPercent, formatPriceCurrency, timestampms } from '@/shared/formatters';

import { useBotStore } from '@/stores/ftbotwrapper';
import { TableField, TableItem } from 'bootstrap-vue-next';
import { computed } from 'vue';

const botStore = useBotStore();

const profitFields: TableField[] = [
  { key: 'metric', label: 'Metric' },
  { key: 'value', label: 'Value' },
];

const profitItems = computed<TableItem[]>(() => {
  return [
    {
      metric: 'Total Trade count',
      value: `${botStore.activeBot.profit.trade_count}`,
    },
    {
      metric: 'Bot started',
      value: timestampms(botStore.activeBot.profit.bot_start_timestamp ?? 0),
    },
    {
      metric: 'First trade opened',
      value: timestampms(botStore.activeBot.profit.first_trade_timestamp),
    },
    {
      metric: 'Latest trade opened',
      value: timestampms(botStore.activeBot.profit.latest_trade_timestamp),
    },
    {
      metric: 'Win / Loss',
      value: `${botStore.activeBot.profit.winning_trades} / ${botStore.activeBot.profit.losing_trades}`,
    },
    {
      metric: 'Winrate',
      value: `${
        botStore.activeBot.profit.winrate ? formatPercent(botStore.activeBot.profit.winrate) : 'N/A'
      }`,
    },
    {
      metric: 'Expectancy (ratio)',
      value: `${
        botStore.activeBot.profit.expectancy
          ? botStore.activeBot.profit.expectancy.toFixed(2)
          : 'N/A'
      } (${
        botStore.activeBot.profit.expectancy_ratio
          ? botStore.activeBot.profit.expectancy_ratio.toFixed(2)
          : 'N/A'
      })`,
    },
    {
      metric: 'Avg Duration',
      value: `${botStore.activeBot.profit.avg_duration}`,
    },
    {
      metric: 'Best performing',
      value: `${botStore.activeBot.profit.best_pair}: ${formatPercent(
        botStore.activeBot.profit.best_pair_profit_ratio,
        2,
      )}`,
    },
    {
      metric: 'Trading volume',
      value: `${formatPriceCurrency(
        botStore.activeBot.profit.trading_volume ?? 0,
        botStore.activeBot.botState.stake_currency,
        botStore.activeBot.botState.stake_currency_decimals ?? 3,
      )}`,
    },
    {
      metric: 'Profit factor',
      value: `${
        botStore.activeBot.profit.profit_factor
          ? botStore.activeBot.profit.profit_factor.toFixed(2)
          : 'N/A'
      }`,
    },
    {
      metric: 'Max Drawdown',
      value: `${
        botStore.activeBot.profit.max_drawdown
          ? formatPercent(botStore.activeBot.profit.max_drawdown, 2)
          : 'N/A'
      } (${
        botStore.activeBot.profit.max_drawdown_abs
          ? formatPriceCurrency(
              botStore.activeBot.profit.max_drawdown_abs,
              botStore.activeBot.botState.stake_currency,
              botStore.activeBot.botState.stake_currency_decimals ?? 3,
            )
          : 'N/A'
      }) ${
        botStore.activeBot.profit.max_drawdown_start_timestamp &&
        botStore.activeBot.profit.max_drawdown_end_timestamp
          ? 'from ' +
            timestampms(botStore.activeBot.profit.max_drawdown_start_timestamp) +
            ' to ' +
            timestampms(botStore.activeBot.profit.max_drawdown_end_timestamp)
          : ''
      }`,
    },
  ];
});
</script>
