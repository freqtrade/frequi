<script setup lang="ts">
import type { StrategyBacktestResult } from '@/types';

const props = defineProps<{
  backtestResult: StrategyBacktestResult;
}>();

const breakdownItems = computed(() => {
  const items = [
    { label: 'Pair', value: 'pair', icon: 'i-mdi-currency-btc' },
    { label: 'Enter tag', value: 'enter-tag', icon: 'i-mdi-tag-arrow-right' },
    { label: 'Exit reason', value: 'exit-reason', icon: 'i-mdi-tag-arrow-left' },
  ];
  if (props.backtestResult.mix_tag_stats) {
    items.push({ label: 'Mixed tag', value: 'mixed-tag', icon: 'i-mdi-tag-multiple' });
  }
  if (props.backtestResult.periodic_breakdown) {
    items.push({ label: 'Periodic', value: 'periodic', icon: 'i-mdi-calendar-month' });
  }
  return items;
});

const breakdown = ref('pair');
</script>

<template>
  <div class="flex flex-col gap-2">
    <UTabs
      v-model="breakdown"
      :items="breakdownItems"
      :content="false"
      variant="pill"
      color="neutral"
      size="sm"
      class="self-start"
    />
    <BacktestResultTablePer
      v-if="breakdown === 'pair'"
      title="Results per pair"
      :results="backtestResult.results_per_pair"
      :stake-currency="backtestResult.stake_currency"
      key-header="Pair"
      :stake-currency-decimals="backtestResult.stake_currency_decimals"
    />
    <BacktestResultTablePer
      v-else-if="breakdown === 'enter-tag'"
      title="Results per Enter tag"
      :results="backtestResult.results_per_enter_tag"
      :stake-currency="backtestResult.stake_currency"
      key-header="Enter Tag"
      :stake-currency-decimals="backtestResult.stake_currency_decimals"
    />
    <BacktestResultTablePer
      v-else-if="breakdown === 'exit-reason'"
      title="Results per Exit reason"
      :results="backtestResult.exit_reason_summary ?? []"
      :stake-currency="backtestResult.stake_currency"
      key-header="Exit Reason"
      :stake-currency-decimals="backtestResult.stake_currency_decimals"
    />
    <BacktestResultTablePer
      v-else-if="breakdown === 'mixed-tag'"
      title="Results Mixed Tag"
      :results="backtestResult.mix_tag_stats ?? []"
      :stake-currency="backtestResult.stake_currency"
      :key-headers="['Enter Tag', 'Exit Tag']"
      :stake-currency-decimals="backtestResult.stake_currency_decimals"
    />
    <DraggableContainer
      v-else-if="breakdown === 'periodic' && backtestResult.periodic_breakdown"
      header="Periodic breakdown"
    >
      <BacktestResultPeriodBreakdown :periodic-breakdown="backtestResult.periodic_breakdown" />
    </DraggableContainer>
  </div>
</template>
