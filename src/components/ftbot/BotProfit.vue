<template>
  <b-table class="text-start" small borderless :items="profitItems" :fields="profitFields">
    <template #cell(value)="row">
      <DateTimeTZ v-if="row.item.isTs && row.value" :date="row.value as number"></DateTimeTZ>
      <template v-else>{{ row.value }}</template>
    </template>
  </b-table>
</template>

<script setup lang="ts">
import { formatPercent, formatPriceCurrency, timestampms } from '@/shared/formatters';

import { ProfitInterface } from '@/types';
import { TableField, TableItem } from 'bootstrap-vue-next';

const props = defineProps({
  profit: { required: true, type: Object as () => ProfitInterface },
  stakeCurrency: { required: true, type: String },
  stakeCurrencyDecimals: { required: true, type: Number },
});

const profitFields: TableField[] = [
  { key: 'metric', label: 'Metric' },
  { key: 'value', label: 'Value' },
];

const profitItems = computed<TableItem[]>(() => {
  if (!props.profit) return [];
  return [
    {
      metric: 'ROI closed trades',
      value: props.profit.profit_closed_coin
        ? `${formatPriceCurrency(
            props.profit.profit_closed_coin,
            props.stakeCurrency,
            props.stakeCurrencyDecimals,
          )} (${formatPercent(props.profit.profit_closed_ratio_mean, 2)})`
        : 'N/A',
      // (&sum; ${formatPercent(props.profit.profit_closed_ratio_sum,  2,)})`
    },
    {
      metric: 'ROI all trades',
      value: props.profit.profit_all_coin
        ? `${formatPriceCurrency(
            props.profit.profit_all_coin,
            props.stakeCurrency,
            props.stakeCurrencyDecimals,
          )} (${formatPercent(props.profit.profit_all_ratio_mean, 2)})`
        : 'N/A',
      //  (&sum; ${formatPercent(props.profit.profit_all_ratio_sum,2,)})`
    },

    {
      metric: 'Total Trade count',
      value: `${props.profit.trade_count ?? 0}`,
    },
    {
      metric: 'Bot started',
      value: props.profit.bot_start_timestamp,
      isTs: true,
    },
    {
      metric: 'First Trade opened',
      value: props.profit.first_trade_timestamp,
      isTs: true,
    },
    {
      metric: 'Latest Trade opened',
      value: props.profit.latest_trade_timestamp,
      isTs: true,
    },
    {
      metric: 'Win / Loss',
      value: `${props.profit.winning_trades ?? 0} / ${props.profit.losing_trades ?? 0}`,
    },
    {
      metric: 'Winrate',
      value: `${props.profit.winrate ? formatPercent(props.profit.winrate) : 'N/A'}`,
    },
    {
      metric: 'Expectancy (ratio)',
      value: `${props.profit.expectancy ? props.profit.expectancy.toFixed(2) : 'N/A'} (${
        props.profit.expectancy_ratio ? props.profit.expectancy_ratio.toFixed(2) : 'N/A'
      })`,
    },
    {
      metric: 'Avg. Duration',
      value: `${props.profit.avg_duration ?? 'N/A'}`,
    },
    {
      metric: 'Best performing',
      value: props.profit.best_pair
        ? `${props.profit.best_pair}: ${formatPercent(props.profit.best_pair_profit_ratio, 2)}`
        : 'N/A',
    },
    {
      metric: 'Trading volume',
      value: `${formatPriceCurrency(
        props.profit.trading_volume ?? 0,
        props.stakeCurrency,
        props.stakeCurrencyDecimals,
      )}`,
    },
    {
      metric: 'Profit factor',
      value: `${props.profit.profit_factor ? props.profit.profit_factor.toFixed(2) : 'N/A'}`,
    },
    {
      metric: 'Max Drawdown',
      value: `${props.profit.max_drawdown ? formatPercent(props.profit.max_drawdown, 2) : 'N/A'} (${
        props.profit.max_drawdown_abs
          ? formatPriceCurrency(
              props.profit.max_drawdown_abs,
              props.stakeCurrency,
              props.stakeCurrencyDecimals,
            )
          : 'N/A'
      }) ${
        props.profit.max_drawdown_start_timestamp && props.profit.max_drawdown_end_timestamp
          ? 'from ' +
            timestampms(props.profit.max_drawdown_start_timestamp) +
            ' to ' +
            timestampms(props.profit.max_drawdown_end_timestamp)
          : ''
      }`,
    },
  ];
});
</script>
