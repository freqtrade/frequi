<script setup lang="ts">
import type { AllProfitStats } from '@/types';

const props = defineProps<{
  profitAll: AllProfitStats;
  stakeCurrency: string;
  stakeCurrencyDecimals: number;
}>();

const profit = computed(() => {
  if (!props.profitAll?.short) {
    return props.profitAll.all;
  }
  return props.profitAll[selectedOption.value];
});

const profitItems = computed(() => {
  if (!profit.value) return [];
  return [
    {
      metric: 'ROI closed trades',
      value: profit.value.profit_closed_coin
        ? `${formatPriceCurrency(
            profit.value.profit_closed_coin,
            props.stakeCurrency,
            props.stakeCurrencyDecimals,
          )} (${formatPercent(profit.value.profit_closed_ratio_mean, 2)})`
        : 'N/A',
      // (&sum; ${formatPercent(profit.value.profit_closed_ratio_sum,  2,)})`
    },
    {
      metric: 'ROI all trades',
      value: profit.value.profit_all_coin
        ? `${formatPriceCurrency(
            profit.value.profit_all_coin,
            props.stakeCurrency,
            props.stakeCurrencyDecimals,
          )} (${formatPercent(profit.value.profit_all_ratio_mean, 2)})`
        : 'N/A',
      //  (&sum; ${formatPercent(profit.value.profit_all_ratio_sum,2,)})`
    },

    {
      metric: 'Total Trade count',
      value: `${profit.value.trade_count ?? 0}`,
    },
    {
      metric: 'Bot started',
      value: profit.value.bot_start_timestamp,
      isTs: true,
    },
    {
      metric: 'First Trade opened',
      value: profit.value.first_trade_timestamp,
      isTs: true,
    },
    {
      metric: 'Latest Trade opened',
      value: profit.value.latest_trade_timestamp,
      isTs: true,
    },
    {
      metric: 'Win / Loss',
      value: `${profit.value.winning_trades ?? 0} / ${profit.value.losing_trades ?? 0}`,
    },
    {
      metric: 'Winrate',
      value: `${profit.value.winrate ? formatPercent(profit.value.winrate) : 'N/A'}`,
    },
    {
      metric: 'Expectancy (ratio)',
      value: `${formatNumber(profit.value.expectancy, 2)} (${formatNumber(profit.value.expectancy_ratio, 2)})'
      })`,
    },
    {
      metric: 'Avg. Duration',
      value: `${profit.value.avg_duration ?? 'N/A'}`,
    },
    {
      metric: 'Best performing',
      value: profit.value.best_pair
        ? `${profit.value.best_pair}: ${formatPercent(profit.value.best_pair_profit_ratio, 2)}`
        : 'N/A',
    },
    {
      metric: 'Trading volume',
      value: `${formatPriceCurrency(
        profit.value.trading_volume ?? 0,
        props.stakeCurrency,
        props.stakeCurrencyDecimals,
      )}`,
    },
    {
      metric: 'Profit factor',
      value: `${formatNumber(profit.value.profit_factor, 2)}`,
    },
    {
      metric: 'Max Drawdown',
      value: `${profit.value.max_drawdown ? formatPercent(profit.value.max_drawdown, 2) : 'N/A'} (${
        profit.value.max_drawdown_abs
          ? formatPriceCurrency(
              profit.value.max_drawdown_abs,
              props.stakeCurrency,
              props.stakeCurrencyDecimals,
            )
          : 'N/A'
      }) ${
        profit.value.max_drawdown_start_timestamp && profit.value.max_drawdown_end_timestamp
          ? 'from ' +
            timestampms(profit.value.max_drawdown_start_timestamp) +
            ' to ' +
            timestampms(profit.value.max_drawdown_end_timestamp)
          : ''
      }`,
    },
    {
      metric: 'Current Drawdown',
      value: `${profit.value.current_drawdown ? formatPercent(profit.value.current_drawdown, 2) : 'N/A'} (${
        profit.value.current_drawdown_abs
          ? formatPriceCurrency(
              profit.value.current_drawdown_abs,
              props.stakeCurrency,
              props.stakeCurrencyDecimals,
            )
          : 'N/A'
      }) ${
        profit.value.current_drawdown_start_timestamp
          ? 'since ' + timestampms(profit.value.current_drawdown_start_timestamp)
          : ''
      }`,
    },
  ];
});

const selectedOption = ref('all');
const options = [
  { value: 'all', text: 'All' },
  { value: 'long', text: 'Long' },
  { value: 'short', text: 'Short' },
];
</script>

<template>
  <div>
    <div v-if="profitAll?.long && profitAll?.short" class="flex justify-between items-center">
      <span>Profits for</span>
      <SelectButton
        v-model="selectedOption"
        :options="options"
        option-label="text"
        option-value="value"
        :allow-empty="false"
        size="small"
      ></SelectButton>
      <span>Trades</span>
    </div>

    <DataTable class="text-start" small borderless :value="profitItems">
      <Column field="metric" header="Metric"></Column>
      <Column field="value" header="Value">
        <template #body="{ data }">
          <DateTimeTZ v-if="data.isTs" :date="data.value" show-timezone />
          <template v-else>
            {{ data.value }}
          </template>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
