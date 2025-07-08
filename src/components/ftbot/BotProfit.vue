<script setup lang="ts">
import type { ProfitInterface } from '@/types';

const props = defineProps({
  profit: { required: true, type: Object as () => ProfitInterface },
  stakeCurrency: { required: true, type: String },
  stakeCurrencyDecimals: { required: true, type: Number },
});

const profitItems = computed(() => {
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
    {
      metric: 'Current Drawdown',
      value: `${props.profit.current_drawdown ? formatPercent(props.profit.current_drawdown, 2) : 'N/A'} (${
        props.profit.current_drawdown_abs
          ? formatPriceCurrency(
              props.profit.current_drawdown_abs,
              props.stakeCurrency,
              props.stakeCurrencyDecimals,
            )
          : 'N/A'
      }) ${
        props.profit.current_drawdown_start_timestamp
          ? 'since ' + timestampms(props.profit.current_drawdown_start_timestamp)
          : ''
      }`,
    },
  ];
});
</script>

<template>
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
</template>
