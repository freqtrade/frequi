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
  <div class="flex flex-col gap-2">
    <div class="h-80">
      <CumProfitChart :trades="backtestResult.trades" :show-title="true" />
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-2 items-start">
      <DraggableContainer header="Strategy settings">
        <UTable
          :data="backtestResultSettings"
          :columns="[
            { accessorKey: 'setting', header: 'Setting' },
            { accessorKey: 'value', header: 'Value' },
          ]"
        />
      </DraggableContainer>
      <DraggableContainer header="Metrics">
        <UTable
          :data="backtestResultStats"
          :columns="[
            { accessorKey: 'metric', header: 'Metric' },
            { accessorKey: 'value', header: 'Value' },
          ]"
        />
      </DraggableContainer>
    </div>
  </div>
</template>
