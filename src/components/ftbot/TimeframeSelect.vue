<script setup lang="ts">
import { TIMEFRAME_OPTIONS_BASE } from '@/shared/timeframes';

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

const availableTimeframes = computed(() => {
  if (!props.belowTimeframe) {
    return TIMEFRAME_OPTIONS_BASE;
  }
  const idx = TIMEFRAME_OPTIONS_BASE.findIndex((v) => v === props.belowTimeframe);

  return [...TIMEFRAME_OPTIONS_BASE].splice(0, idx);
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
