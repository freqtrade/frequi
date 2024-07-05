<template>
  <div>
    <div class="d-flex flex-col flex-xl-row justify-content-between mt-1">
      <BFormGroup class="col flex-grow-1" label="Type" label-for="plotTypeSelector">
        <BFormSelect
          id="plotTypeSelector"
          v-model="graphType"
          size="sm"
          :options="availableGraphTypes"
        >
        </BFormSelect>
      </BFormGroup>
      <BFormGroup label="Color" label-for="colsel" size="sm" class="ms-xl-1 col">
        <BInputGroup>
          <template #prepend>
            <BFormInput
              v-model="selColor"
              type="color"
              size="sm"
              class="p-0"
              style="max-width: 29px"
            ></BFormInput>
          </template>
          <BFormInput id="colsel" v-model="selColor" size="sm" class="flex-grow-1"> </BFormInput>
          <template #append>
            <BButton variant="primary" size="sm" @click="newColor">
              <i-mdi-dice-multiple />
            </BButton>
          </template>
        </BInputGroup>
      </BFormGroup>
    </div>
    <PlotIndicatorSelect
      v-if="graphType === ChartType.line"
      v-model="fillTo"
      :columns="columns"
      class="mt-1"
      label="Area chart - Fill to (leave empty for line chart)"
    />
  </div>
</template>

<script setup lang="ts">
import { ChartType, IndicatorConfig } from '@/types';

import { watchDebounced } from '@vueuse/core';

const props = defineProps({
  modelValue: { required: true, type: Object as () => Record<string, IndicatorConfig> },
  columns: { required: true, type: Array as () => string[] },
});

const emit = defineEmits(['update:modelValue']);
const selColor = ref(randomColor());
const graphType = ref<ChartType>(ChartType.line);
const availableGraphTypes = ref(Object.keys(ChartType));
const selAvailableIndicator = ref('');
const cancelled = ref(false);
const fillTo = ref('');

function newColor() {
  selColor.value = randomColor();
}

const combinedIndicator = computed<IndicatorConfig>(() => {
  if (cancelled.value || !selAvailableIndicator.value) {
    return {};
  }
  const val: IndicatorConfig = {
    color: selColor.value,
    type: graphType.value,
  };
  if (fillTo.value && graphType.value === ChartType.line) {
    val.fill_to = fillTo.value;
  }
  return {
    [selAvailableIndicator.value]: val,
  };
});

function emitIndicator() {
  emit('update:modelValue', combinedIndicator.value);
}

watch(
  () => props.modelValue,
  () => {
    [selAvailableIndicator.value] = Object.keys(props.modelValue);
    cancelled.value = false;
    if (selAvailableIndicator.value && props.modelValue) {
      const xx = props.modelValue[selAvailableIndicator.value];
      selColor.value = xx.color || randomColor();
      graphType.value = xx.type || ChartType.line;
      fillTo.value = xx.fill_to || '';
    }
  },
  {
    immediate: true,
  },
);

watchDebounced(
  [selColor, graphType, fillTo],
  () => {
    emitIndicator();
  },
  {
    debounce: 200,
  },
);
</script>

<style scoped></style>
