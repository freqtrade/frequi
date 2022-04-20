<template>
  <b-form-select
    v-model="selectedTimeframe"
    placeholder="Use strategy default"
    :options="availableTimeframes"
    @change="emitSelectedTimeframe"
  ></b-form-select>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api';

export default defineComponent({
  name: 'TimefameSelect',
  props: {
    value: { default: '', type: String },
    belowTimeframe: { required: false, default: '', type: String },
  },
  emits: ['input'],
  setup(props, { emit }) {
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

    return {
      availableTimeframesBase,
      availableTimeframes,
      emitSelectedTimeframe,
      selectedTimeframe,
    };
  },
});
</script>

<style scoped></style>
