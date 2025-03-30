<script setup lang="ts">
interface Props {
  value?: string;
  belowTimeframe?: string;
  size?: undefined | 'small' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  belowTimeframe: '',
  size: undefined,
});
const emit = defineEmits<{ input: [value: string] }>();

const selectedTimeframe = ref('');
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

const availableTimeframes = computed(() => {
  if (!props.belowTimeframe) {
    return availableTimeframesBase;
  }
  const idx = availableTimeframesBase.findIndex((v) => v === props.belowTimeframe);

  return [...availableTimeframesBase].splice(0, idx);
});

const emitSelectedTimeframe = () => {
  emit('input', selectedTimeframe.value);
};
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
