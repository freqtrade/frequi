<script setup lang="ts">
import type { ChartTypeString, IndicatorConfig } from '@/types';
import { ChartType } from '@/types';

const props = defineProps({
  modelValue: { required: true, type: Object as () => Record<string, IndicatorConfig> },
  columns: { required: true, type: Array as () => string[] },
});

const emit = defineEmits<{ 'update:modelValue': [value: IndicatorConfig] }>();

const selColor = ref(randomColor());
const graphType = ref<ChartTypeString>(ChartType.line);
const availableGraphTypes = ref<ChartTypeString[]>(Object.keys(ChartType) as ChartTypeString[]);
const selAvailableIndicator = ref('');
const cancelled = ref(false);
const fillTo = ref('');
const scatterSymbolSize = ref(3);

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
  if (graphType.value == ChartType.scatter) {
    val.scatterSymbolSize = scatterSymbolSize.value;
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
  [selColor, graphType, fillTo, scatterSymbolSize],
  () => {
    emitIndicator();
  },
  {
    debounce: 200,
  },
);
</script>

<template>
  <div>
    <div class="flex flex-col flex-xl-row justify-content-between mt-1">
      <label for="plotTypeSelector" class="form-label">Type</label>
      <Select id="plotTypeSelector" v-model="graphType" size="small" :options="availableGraphTypes">
      </Select>
      <BFormGroup label="Color" label-for="colsel" size="sm" class="ms-xl-1 col">
        <BInputGroup>
          <template #prepend>
            <InputText
              v-model="selColor"
              type="color"
              size="small"
              class="p-0"
              style="max-width: 29px"
            ></InputText>
          </template>
          <InputText id="colsel" v-model="selColor" size="small" class="grow"> </InputText>
          <template #append>
            <Button severity="primary" size="small" @click="newColor">
              <template #icon>
                <i-mdi-dice-multiple />
              </template>
            </Button>
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
    <BFormGroup
      v-if="graphType === ChartType.scatter"
      label="Scatter symbol size"
      label-class="mt-1"
    >
      <BFormSpinbutton v-model="scatterSymbolSize" />
    </BFormGroup>
  </div>
</template>
