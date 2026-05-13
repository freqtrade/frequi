<script setup lang="ts">
interface Props {
  value?: string;
  belowTimeframe?: string;
  size?: undefined | 'sm' | 'md' | 'lg' | 'xl';
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
  { value: null, label: 'Use strategy default' },
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '2h', label: '2h' },
  { value: '4h', label: '4h' },
  { value: '6h', label: '6h' },
  { value: '8h', label: '8h' },
  { value: '12h', label: '12h' },
  { value: '1d', label: '1d' },
  { value: '3d', label: '3d' },
  { value: '1w', label: '1w' },
  { value: '2w', label: '2w' },
  { value: '1M', label: '1M' },
  { value: '1y', label: '1y' },
];

const availableTimeframes = computed(() => {
  if (!props.belowTimeframe) {
    return availableTimeframesBase;
  }
  const idx = availableTimeframesBase.findIndex((v) => v.value === props.belowTimeframe);

  return [...availableTimeframesBase].splice(0, idx);
});

const emitSelectedTimeframe = () => {
  emit('input', selectedTimeframe.value);
};
</script>

<template>
  <USelect
    v-model="selectedTimeframe"
    placeholder="Use strategy default"
    :size="size"
    :items="availableTimeframes"
    @change="emitSelectedTimeframe"
  ></USelect>
</template>
