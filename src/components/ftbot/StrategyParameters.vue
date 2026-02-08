<script setup lang="ts">
import type { StrategyResult } from '@/types';

const props = defineProps<{
  strategy: StrategyResult;
}>();

const sortedParamsBySpace = computed<Record<string, typeof props.strategy.params>>(() => {
  // Group by space and sort by space, then by name
  const paramsBySpace: Record<string, typeof props.strategy.params> = {};
  props.strategy.params.forEach((param) => {
    if (!paramsBySpace[param.space]) {
      paramsBySpace[param.space] = [];
    }
    paramsBySpace[param.space]?.push(param);
  });
  const sortedSpaces = Object.keys(paramsBySpace).sort();
  const sortedParams: typeof props.strategy.params = [];
  sortedSpaces.forEach((space) => {
    const params = paramsBySpace[space]!.sort((a, b) => a.name.localeCompare(b.name));
    sortedParams.push(...params);
  });
  return paramsBySpace;
});
</script>

<template>
  <div v-if="strategy.params && strategy.params.length > 0">
    <h2 class="text-lg font-bold mb-2">Parameters for this strategy</h2>
    <div v-for="(params, space) in sortedParamsBySpace" :key="space" class="mb-4">
      <h3 class="text-md font-bold mb-2">{{ space }}</h3>
      <div
        v-for="param in params"
        :key="param.name"
        class="mb-2 flex justify-between"
        :title="param.param_type"
      >
        <span>{{ param.name }}</span>
        <span>{{ param.value }}</span>
      </div>
    </div>
  </div>
  <div v-else class="p-4">
    <p>This strategy has no parameters.</p>
  </div>
</template>
