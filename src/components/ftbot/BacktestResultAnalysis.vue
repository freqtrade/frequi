<script setup lang="ts">
import type { StrategyBacktestResult } from '@/types';

const props = defineProps<{
  backtestResult: StrategyBacktestResult;
}>();

const backtestResultStats = computed(() => {
  const tmp = generateBacktestMetricRows(props.backtestResult);
  return formatObjectForTable({ value: tmp }, 'metric');
});

const backtestResultSettings = computed(() => {
  // Transpose Result into readable format
  const tmp = generateBacktestSettingRows(props.backtestResult);

  return formatObjectForTable({ value: tmp }, 'setting');
});
</script>

<template>
  <div class="px-0 w-full">
    <div class="flex justify-center">
      <h3 class="font-bold text-2xl mb-2">
        Backtest-result for {{ backtestResult.strategy_name }}
      </h3>
    </div>

    <div class="flex flex-col text-start ms-0 me-2 gap-2">
      <div class="flex flex-col xl:flex-row">
        <div class="px-0 px-xl-0 pe-xl-1 grow">
          <DraggableContainer header="Strategy settings">
            <DataTable size="small" :value="backtestResultSettings">
              <Column field="setting" header="Setting"></Column>
              <Column field="value" header="Value"></Column>
            </DataTable>
          </DraggableContainer>
        </div>
        <div class="px-0 xl:px-0 pt-2 xl:pt-0 xl:ps-1 grow">
          <DraggableContainer header="Metrics">
            <DataTable size="small" borderless :value="backtestResultStats">
              <Column field="metric" header="Metric" />
              <Column field="value" header="Value" />
            </DataTable>
          </DraggableContainer>
        </div>
      </div>
      <BacktestResultTablePer
        title="Results per Enter tag"
        :results="backtestResult.results_per_enter_tag"
        :stake-currency="backtestResult.stake_currency"
        key-header="Enter Tag"
        :stake-currency-decimals="backtestResult.stake_currency_decimals"
      />

      <BacktestResultTablePer
        title="Results per Exit reason"
        :results="backtestResult.exit_reason_summary ?? []"
        :stake-currency="backtestResult.stake_currency"
        key-header="Exit Reason"
        :stake-currency-decimals="backtestResult.stake_currency_decimals"
      />

      <BacktestResultTablePer
        v-if="backtestResult.mix_tag_stats"
        title="Results Mixed Tag"
        :results="backtestResult.mix_tag_stats ?? []"
        :stake-currency="backtestResult.stake_currency"
        :key-headers="['Enter Tag', 'Exit Tag']"
        :stake-currency-decimals="backtestResult.stake_currency_decimals"
      />

      <BacktestResultTablePer
        title="Results per pair"
        :results="backtestResult.results_per_pair"
        :stake-currency="backtestResult.stake_currency"
        key-header="Pair"
        :stake-currency-decimals="backtestResult.stake_currency_decimals"
      />
      <DraggableContainer v-if="backtestResult.periodic_breakdown" header="Periodic breakdown">
        <BacktestResultPeriodBreakdown :periodic-breakdown="backtestResult.periodic_breakdown">
        </BacktestResultPeriodBreakdown>
      </DraggableContainer>

      <DraggableContainer header="Single trades">
        <TradeList
          :trades="backtestResult.trades"
          :show-filter="true"
          :stake-currency="backtestResult.stake_currency"
        />
      </DraggableContainer>
    </div>
  </div>
</template>
