<template>
  <div>
    <div v-if="addNew">
      <b-form-group label="Add indicator" label-for="indicatorSelector">
        <b-input-group size="sm">
          <b-form-input v-model="indicatorFilter" placeholder="Filter indicators"></b-form-input>
          <b-input-group-append>
            <Reset
              class="pointer align-self-center ms-1"
              :size="18"
              @click="indicatorFilter = ''"
            ></Reset>
          </b-input-group-append>
        </b-input-group>
        <b-form-select
          id="indicatorSelector"
          v-model="selAvailableIndicator"
          :options="filteredIndicators"
          :select-size="4"
        >
        </b-form-select>
      </b-form-group>
    </div>
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
    <div class="d-flex flex-row mt-2">
      <b-button
        v-if="addNew"
        class="col"
        variant="secondary"
        title="Add "
        size="sm"
        @click="clickCancel"
      >
        Cancel
      </b-button>
      <b-button
        v-if="addNew"
        class="ms-1 col"
        variant="primary"
        title="Add "
        size="sm"
        @click="emitIndicator"
      >
        Save indicator
      </b-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartType, IndicatorConfig } from '@/types';
import randomColor from '@/shared/randomColor';
import Reset from 'vue-material-design-icons/CloseCircleOutline.vue';

import { computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: { required: true, type: Object as () => Record<string, IndicatorConfig> },
  columns: { required: true, type: Array as () => string[] },
  addNew: { required: true, type: Boolean },
});

const emit = defineEmits(['update:modelValue']);
const selColor = ref(randomColor());
const graphType = ref<ChartType>(ChartType.line);
const availableGraphTypes = ref(Object.keys(ChartType));
const indicatorFilter = ref('');
const selAvailableIndicator = ref('');
const cancelled = ref(false);

const filteredIndicators = computed(() => {
  return props.columns.filter((col) =>
    col.toLowerCase().includes(indicatorFilter.value.toLowerCase()),
  );
});

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

function clickCancel() {
  cancelled.value = true;
  emitIndicator();
}

watch(
  () => props.modelValue,
  () => {
    [selAvailableIndicator.value] = Object.keys(props.modelValue);
    cancelled.value = false;
    if (selAvailableIndicator.value && props.modelValue) {
      selColor.value = props.modelValue[selAvailableIndicator.value].color || randomColor();
      graphType.value = props.modelValue[selAvailableIndicator.value].type || ChartType.line;
    }
  },
  {
    immediate: true,
  },
);

watch([selColor, graphType], () => {
  if (!props.addNew) {
    emitIndicator();
  }
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
