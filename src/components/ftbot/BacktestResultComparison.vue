<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { BacktestResultInMemory } from '@/types';

const props = withDefaults(
  defineProps<{
    backtestResults: Record<string, BacktestResultInMemory>;
  }>(),
  {},
);

const backtestResultStats = computed(() => {
  const values = {};
  Object.entries(props.backtestResults).forEach(([key, result]) => {
    const tmp = generateBacktestMetricRows(result.strategy);
    values[key] = tmp;
  });
  console.log(values);
  // return '';
  return formatObjectForTable(values, 'metric');
});

const backtestResultFields = computed(() => {
  const res = [{ key: 'metric', label: 'Metric' }];
  Object.entries(props.backtestResults).forEach(([key, value]) => {
    res.push({ key, label: value.metadata.strategyName });
  });
  return res;
});

const BacktestResultSelectEntry = resolveComponent('BacktestResultSelectEntry');

const tableColumns = computed(() => {
  return backtestResultFields.value.map((col) => ({
    accessorKey: col.key,
    header: () => {
      if (col.key && props.backtestResults[col.key]) {
        return h(BacktestResultSelectEntry, {
          backtestResult: props.backtestResults[col.key],
        });
      }
      return col.label;
    },
  }));
});
</script>

<template>
  <div class="px-0 mw-full">
    <div class="flex justify-center">
      <h3 class="font-bold text-3xl">Backtest-result comparison</h3>
    </div>
    <div class="flex flex-col text-start ms-0 me-2 gap-2">
      <div class="flex flex-col flex-xl-row">
        <div class="px-0 xl:px-0 pt-2 xl:pt-0 xl:ps-1 flex-fill">
          <UTable :data="backtestResultStats" :columns="tableColumns" />
        </div>
      </div>
    </div>
  </div>
</template>
