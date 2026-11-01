<script setup lang="ts">
import type { StrategyBacktestResult } from '@/types';

const props = defineProps<{
  backtestResult: StrategyBacktestResult;
}>();

interface Kpi {
  label: string;
  value: string;
  sub: string;
  color?: 'success' | 'error';
}

const kpis = computed<Kpi[]>(() => {
  const r = props.backtestResult;
  const formatStake = (value?: number) =>
    `${formatPrice(value ?? 0, r.stake_currency_decimals)} ${r.stake_currency}`;
  const summary = r.results_per_pair[r.results_per_pair.length - 1];
  const winrate =
    summary?.winrate ?? (summary && summary.trades > 0 ? summary.wins / summary.trades : undefined);

  return [
    {
      label: 'Profit',
      value: formatPercent(r.profit_total, 2),
      sub: formatStake(r.profit_total_abs),
      color: r.profit_total >= 0 ? 'success' : 'error',
    },
    {
      label: 'Trades',
      value: `${r.total_trades}`,
      sub: `${formatNumber(r.trades_per_day, 2)} / day`,
    },
    {
      label: 'Win rate',
      value: winrate !== undefined ? formatPercent(winrate, 1) : 'N/A',
      sub: summary ? `${summary.wins} / ${summary.draws} / ${summary.losses}` : '',
    },
    {
      label: 'Max drawdown',
      value: formatPercent(r.max_drawdown_account, 2),
      sub: formatStake(r.max_drawdown_abs),
      color: 'error',
    },
    {
      label: 'Sharpe',
      value: formatNumber(r.sharpe, 2),
      sub: `Sortino ${formatNumber(r.sortino, 2)}`,
    },
    {
      label: 'Profit factor',
      value: formatNumber(r.profit_factor, 2),
      sub: `Expectancy ${formatNumber(r.expectancy, 2)}`,
    },
  ];
});
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
    <UCard v-for="kpi in kpis" :key="kpi.label" :ui="{ body: 'p-2 sm:p-2' }">
      <div class="text-xs text-muted uppercase tracking-wide">{{ kpi.label }}</div>
      <div
        class="text-xl font-bold"
        :class="{ 'text-success': kpi.color === 'success', 'text-error': kpi.color === 'error' }"
      >
        {{ kpi.value }}
      </div>
      <div class="text-xs text-muted truncate">{{ kpi.sub }}</div>
    </UCard>
  </div>
</template>
