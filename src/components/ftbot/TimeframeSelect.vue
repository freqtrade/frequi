<script setup lang="ts">
interface Props {
  modelValue?: string;
  value?: string;
  belowTimeframe?: string;
  includeSeconds?: boolean;
  maxTimeframe?: string;
  size?: undefined | 'small' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  value: '',
  belowTimeframe: '',
  includeSeconds: false,
  maxTimeframe: '',
  size: undefined,
});
const emit = defineEmits<{
  input: [value: string];
  'update:modelValue': [value: string];
}>();

const selectedTimeframe = ref(props.modelValue ?? props.value ?? '');
// The below list must always remain sorted correctly!
const availableTimeframesBase = [
  // Placeholder value
  { value: '', text: 'Use strategy default' },
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '8h',
  '12h',
  '1d',
  '3d',
  '1w',
  '2w',
  '1M',
  '1y',
];
const availableSecondsTimeframes = ['1s', '5s', '10s', '15s', '30s', '45s'];

const availableTimeframes = computed(() => {
  let options = props.includeSeconds
    ? [availableTimeframesBase[0], ...availableSecondsTimeframes, ...availableTimeframesBase.slice(1)]
    : availableTimeframesBase;

  if (props.maxTimeframe) {
    const maxIdx = options.findIndex((v) => v === props.maxTimeframe);
    if (maxIdx >= 0) {
      options = options.slice(0, maxIdx + 1);
    }
  }

  if (props.belowTimeframe) {
    const idx = options.findIndex((v) => v === props.belowTimeframe);
    if (idx >= 0) {
      return options.slice(0, idx);
    }
  }

  return options;
});

const emitSelectedTimeframe = () => {
  emit('input', selectedTimeframe.value);
  emit('update:modelValue', selectedTimeframe.value);
};

watch(
  () => props.modelValue ?? props.value ?? '',
  (value) => {
    selectedTimeframe.value = value;
  },
);
</script>

<template>
  <Select
    v-model="selectedTimeframe"
    placeholder="Use strategy default"
    :option-label="(option) => option.text || option"
    :option-value="(option) => option.value ?? option"
    :size="size"
    :options="availableTimeframes"
    @change="emitSelectedTimeframe"
  ></Select>
</template>
