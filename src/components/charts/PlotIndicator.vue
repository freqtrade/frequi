<script setup lang="ts">
import type { ChartTypeString, IndicatorConfig } from '@/types';
import { ChartType } from '@/types';

const props = withDefaults(
  defineProps<{
    modelValue: Record<string, IndicatorConfig>;
    columns: string[];
  }>(),
  {},
);

const emit = defineEmits<{ 'update:modelValue': [value: IndicatorConfig] }>();

const selColor_ = ref(randomColor());
const selColor = computed({
  get: () => selColor_.value,
  set: (val) => {
    if (
      !val.startsWith('#') &&
      (val.length === 3 || val.length === 6) &&
      /^[0-9a-fA-F]+$/.test(val)
    ) {
      val = `#${val}`;
    }
    selColor_.value = val;
  },
});
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
    const [firstIndicator] = Object.keys(props.modelValue);
    if (firstIndicator) {
      selAvailableIndicator.value = firstIndicator;
    }
    cancelled.value = false;
    if (selAvailableIndicator.value && props.modelValue) {
      const xx = props.modelValue[selAvailableIndicator.value];
      if (!xx) return;
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
    <div class="flex flex-col lg:flex-row justify-between mt-1">
      <div class="flex flex-col w-full">
        <label for="plotTypeSelector" class="form-label">Type</label>
        <Select
          id="plotTypeSelector"
          v-model="graphType"
          class="text-left"
          size="small"
          :options="availableGraphTypes"
        >
        </Select>
      </div>
      <div class="flex flex-col w-full">
        <label for="selAvailableIndicator" class="colsel">Color</label>
        <InputGroup>
          <InputGroupAddon class="p-0!">
            <ColorPicker v-model="selColor" type="color" class="m-auto"></ColorPicker>
          </InputGroupAddon>
          <InputText id="colsel" v-model="selColor" size="small" class="grow"> </InputText>
          <InputGroupAddon>
            <Button severity="primary" size="small" @click="newColor">
              <template #icon>
                <i-mdi-dice-multiple />
              </template>
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
    <PlotIndicatorSelect
      v-if="graphType === ChartType.line"
      v-model="fillTo"
      :columns="columns"
      class="mt-1"
      label="Area chart - Fill to (leave empty for line chart)"
    />
    <div v-if="graphType === ChartType.scatter" class="flex flex-col mt-2 gap-1 items-center">
      <label for="scatterSymbolSize" class="text-nowrap">Scatter symbol size</label>
      <InputNumber
        id="scatterSymbolSize"
        v-model="scatterSymbolSize"
        :min="0"
        show-buttons
        size="small"
        button-layout="horizontal"
        class="text-center w-full"
      />
    </div>
  </div>
</template>
