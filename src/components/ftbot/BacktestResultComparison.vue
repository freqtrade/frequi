<script setup lang="ts">
import type { BacktestResultInMemory } from '@/types';

import type { TableField } from 'bootstrap-vue-next';

const props = defineProps({
  backtestResults: { required: true, type: Object as () => Record<string, BacktestResultInMemory> },
});

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

const backtestResultFields = computed<TableField[]>(() => {
  const res = [{ key: 'metric', label: 'Metric' }];
  Object.entries(props.backtestResults).forEach(([key, value]) => {
    res.push({ key, label: value.metadata.strategyName });
  });
  return res;
});
</script>

<template>
  <div class="px-0 mw-100">
    <div class="d-flex justify-content-center">
      <h3>Backtest-result comparison</h3>
    </div>

    <!-- <div class="d-flex">
      <div v-for="[key, result] in Object.entries(backtestResults)" :key="key" class="border m-1">
        <BacktestResultSelectEntry :backtest-result="result" />
      </div>
    </div> -->
    <div class="d-flex flex-column text-start ms-0 me-2 gap-2">
      <div class="d-flex flex-column flex-xl-row">
        <div class="px-0 px-xl-0 pt-2 pt-xl-0 ps-xl-1 flex-fill">
          <BTable bordered :items="backtestResultStats" :fields="backtestResultFields">
            <template
              v-for="[key, result] in Object.entries(backtestResults)"
              #[`head(${key})`]
              :key="key"
            >
              <BacktestResultSelectEntry :backtest-result="result" />
            </template>
          </BTable>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
