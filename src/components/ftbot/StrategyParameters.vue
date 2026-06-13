<script setup lang="ts">
import type {
  AllStrategyParameter,
  BooleanParameter,
  CategoricalParameter,
  DecimalParameter,
  IntParameter,
  RealParameter,
  StrategyResult,
} from '@/types';
import { ParameterType } from '@/types';

type StrategyParameterValue = boolean | number | string;

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

function normalizeParameterValue(param: AllStrategyParameter): StrategyParameterValue {
  if (param.param_type === ParameterType.BooleanParameter) {
    return typeof param.value === 'boolean' ? param.value : param.value === 'true';
  }
  return param.value;
}

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
  return undefined;
}

function getNumberFormatOptions(param: AllStrategyParameter): Intl.NumberFormatOptions | undefined {
  if (param.param_type === ParameterType.IntParameter) {
    return { maximumFractionDigits: 0 };
  }
  if (param.param_type === ParameterType.DecimalParameter) {
    return { maximumFractionDigits: param.decimals };
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

function getStringValue(name: string): string | undefined {
  const value = parameters.value[name];
  return typeof value === 'string' ? value : undefined;
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
          class="mb-1"
          @click="resetParameters"
          icon="mdi:restore"
          title="Reset modified parameters"
          label="Reset space parameters"
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
              @update:model-value="(value) => setParameterValue(param.name, value ?? param.low)"
            />
            <USelect
              v-else-if="isCategoricalParameter(param)"
              :id="`strategy-param-${param.name}`"
              :model-value="getStringValue(param.name)"
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
  </div>
  <div v-else class="p-4">
    <p>This strategy has no parameters.</p>
  </div>
</template>
