<template>
  <div>
    <div class="d-flex flex-col flex-xl-row justify-content-between mt-1">
      <b-form-group class="col flex-grow-1" label="Type" label-for="plotTypeSelector">
        <b-form-select
          id="plotTypeSelector"
          v-model="graphType"
          size="sm"
          :options="availableGraphTypes"
        >
        </b-form-select>
      </b-form-group>
      <b-form-group label="Color" label-for="colsel" size="sm" class="ms-xl-1 col">
        <b-input-group>
          <b-input-group-prepend>
            <div :style="{ 'background-color': selColor }" class="colorbox me-1"></div>
          </b-input-group-prepend>
          <b-form-input id="colsel" v-model="selColor" size="sm"> </b-form-input>
          <b-input-group-append>
            <b-button variant="primary" size="sm" @click="newColor">&#x21bb;</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartType, IndicatorConfig } from '@/types';
import randomColor from '@/shared/randomColor';

import { computed, ref, watch } from 'vue';

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

function newColor() {
  selColor.value = randomColor();
}

const combinedIndicator = computed(() => {
  if (cancelled.value || !selAvailableIndicator.value) {
    return {};
  }
  return {
    [selAvailableIndicator.value]: {
      color: selColor.value,
      type: graphType.value,
    },
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
    }
  },
  {
    immediate: true,
  },
);

watch([selColor, graphType], () => {
  emitIndicator();
});
</script>

<style scoped>
.colorbox {
  border-radius: 50% !important;
  margin-top: auto;
  margin-bottom: auto;
  height: 25px;
  width: 25px;
  vertical-align: center;
}
.pointer {
  cursor: pointer;
}
</style>
