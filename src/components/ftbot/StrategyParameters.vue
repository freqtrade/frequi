<script setup lang="ts">
import type {
  AllStrategyParameter,
  BooleanParameter,
  CategoricalParameter,
  DecimalParameter,
  IntParameter,
  RealParameter,
  StrategyCategoricalValue,
  StrategyParameterValue,
  StrategyResult,
} from '@/types';
import { ParameterType } from '@/types';

const props = withDefaults(
  defineProps<{
    strategy: StrategyResult;
    editable?: boolean;
  }>(),
  {
    editable: false,
  },
);

const parameters = defineModel<Record<string, StrategyParameterValue>>('parameters', {
  default: () => ({}),
});

watch(
  () => props.strategy.params,
  (nextParams) => {
    parameters.value = Object.fromEntries(
      nextParams.map((param) => [param.name, normalizeParameterValue(param)]),
    );
  },
  { immediate: true },
);

function getNumberStep(param: AllStrategyParameter): number | undefined {
  if (param.param_type === ParameterType.IntParameter) {
    return 1;
  }
  if (param.param_type === ParameterType.DecimalParameter) {
    return 1 / 10 ** param.decimals;
  }
  if (param.param_type === ParameterType.RealParameter) {
    // Step 1% of the range, limited to 8 decimals
    return 0.01;
  }
  return undefined;
}

function getNumberFormatOptions(param: AllStrategyParameter): Intl.NumberFormatOptions | undefined {
  if (param.param_type === ParameterType.IntParameter) {
    return { maximumFractionDigits: 0 };
  }
  if (param.param_type === ParameterType.DecimalParameter) {
    return { maximumFractionDigits: param.decimals };
  }
  if (param.param_type === ParameterType.RealParameter) {
    return { maximumFractionDigits: 8 };
  }
  return undefined;
}

function isNumericParameter(
  param: AllStrategyParameter,
): param is IntParameter | RealParameter | DecimalParameter {
  return [
    ParameterType.IntParameter,
    ParameterType.RealParameter,
    ParameterType.DecimalParameter,
  ].includes(param.param_type);
}

function isCategoricalParameter(param: AllStrategyParameter): param is CategoricalParameter {
  return param.param_type === ParameterType.CategoricalParameter;
}

function isBooleanParameter(param: AllStrategyParameter): param is BooleanParameter {
  return param.param_type === ParameterType.BooleanParameter;
}

function setParameterValue(name: string, value: StrategyParameterValue): void {
  // Must reassign the whole object to maintain reactivity
  parameters.value = {
    ...parameters.value,
    [name]: value,
  };
}

function getNumericValue(name: string): number | null {
  const value = parameters.value[name];
  return typeof value === 'number' ? value : null;
}

function getCategoricalValue(name: string): StrategyCategoricalValue | undefined {
  return parameters.value[name];
}

function getBooleanValue(name: string): boolean {
  return parameters.value[name] === true;
}

const sortedParamsBySpace = computed<Record<string, typeof props.strategy.params>>(() => {
  const paramsBySpace: Record<string, typeof props.strategy.params> = {};
  props.strategy.params.forEach((param) => {
    if (!paramsBySpace[param.space]) {
      paramsBySpace[param.space] = [];
    }
    paramsBySpace[param.space]?.push(param);
  });
  const sortedSpaces = Object.keys(paramsBySpace).sort();
  const sortedParamsBySpace: Record<string, typeof props.strategy.params> = {};
  sortedSpaces.forEach((space) => {
    const params = paramsBySpace[space]!.sort((a, b) => a.name.localeCompare(b.name));
    sortedParamsBySpace[space] = params;
  });
  return sortedParamsBySpace;
});

function resetParameters(): void {
  parameters.value = Object.fromEntries(
    props.strategy.params.map((param) => [param.name, normalizeParameterValue(param)]),
  );
}

function resetSpaceParameters(space: string): void {
  const spaceDefaults = Object.fromEntries(
    props.strategy.params
      .filter((param) => param.space === space)
      .map((param) => [param.name, normalizeParameterValue(param)]),
  );
  parameters.value = {
    ...parameters.value,
    ...spaceDefaults,
  };
}

function resetParameter(param: AllStrategyParameter): void {
  setParameterValue(param.name, normalizeParameterValue(param));
}
</script>

<template>
  <div v-if="strategy.params && strategy.params.length > 0" class="text-start">
    <div v-for="(params, space) in sortedParamsBySpace" :key="space" class="mb-4">
      <div class="flex justify-between">
        <h3 class="text-md font-bold underline mb-2" :title="`Space ${space}`">
          {{ space }}
        </h3>
        <UButton
          v-if="editable"
          variant="outline"
          color="neutral"
          size="sm"
          class="mb-1"
          @click="resetSpaceParameters(space)"
          icon="mdi:restore"
          title="Reset parameters of this space to their default values"
          label="Reset space"
        />
      </div>
      <div
        v-for="param in params"
        :key="param.name"
        class="mb-1 flex items-center justify-between gap-2"
        :title="param.param_type"
      >
        <template v-if="!editable">
          <span>{{ param.name }}</span>
          <span>{{ param.value }}</span>
        </template>
        <template v-else>
          <UFormField orientation="horizontal" :label="param.name" class="w-full">
            <UInputNumber
              v-if="isNumericParameter(param)"
              :id="`strategy-param-${param.name}`"
              :model-value="getNumericValue(param.name)"
              class="w-44"
              :min="param.low"
              :max="param.high"
              :step="getNumberStep(param)"
              :step-snapping="param.param_type === ParameterType.IntParameter"
              :format-options="getNumberFormatOptions(param)"
              @update:model-value="(value) => setParameterValue(param.name, value ?? param.value)"
            />
            <USelect
              v-else-if="isCategoricalParameter(param)"
              :id="`strategy-param-${param.name}`"
              :model-value="getCategoricalValue(param.name)"
              :items="param.opt_range"
              class="w-44"
              @update:model-value="(value) => setParameterValue(param.name, value)"
            />
            <USwitch
              v-else-if="isBooleanParameter(param)"
              :id="`strategy-param-${param.name}`"
              :model-value="getBooleanValue(param.name)"
              @update:model-value="(value) => setParameterValue(param.name, value)"
            />
          </UFormField>
          <UButton
            variant="outline"
            color="neutral"
            size="md"
            @click="resetParameter(param)"
            icon="mdi:restore"
            title="Reset parameter to default value"
          />
        </template>
      </div>
    </div>
    <div v-if="editable" class="flex justify-end mb-2">
      <UButton
        variant="outline"
        @click="resetParameters"
        icon="mdi:restore"
        title="Reset all parameters to their default values"
        label="Reset all"
      />
    </div>
  </div>
  <div v-else class="p-4">
    <p>This strategy has no parameters.</p>
  </div>
</template>
