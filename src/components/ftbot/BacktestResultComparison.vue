<script setup lang="ts">
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
</script>

<template>
  <div class="px-0 mw-full">
    <div class="flex justify-center">
      <h3 class="font-bold text-3xl">Backtest-result comparison</h3>
    </div>
    <div class="flex flex-col text-start ms-0 me-2 gap-2">
      <div class="flex flex-col flex-xl-row">
        <div class="px-0 xl:px-0 pt-2 xl:pt-0 xl:ps-1 flex-fill">
          <DataTable bordered :value="backtestResultStats" size="small" show-gridlines>
            <Column
              v-for="col in backtestResultFields"
              :key="col.key"
              :field="col.key"
              :label="col.label"
            >
              <template #header>
                <BacktestResultSelectEntry
                  v-if="col.key && backtestResults[col.key]"
                  :backtest-result="backtestResults[col.key]!"
                />
                <span v-else>{{ col.label }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
</template>
