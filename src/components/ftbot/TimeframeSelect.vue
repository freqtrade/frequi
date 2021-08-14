<template>
  <b-form-select
    v-model="selectedTimeframe"
    placeholder="Use strategy default"
    :options="availableTimeframes"
    @change="emitSelectedTimeframe"
  ></b-form-select>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({})
export default class Template extends Vue {
  selectedTimeframe = '';

  @Prop({ default: '' }) value!: string;

  // Filter available timeframes to be lower than this timeframe.
  @Prop({ default: '', required: false }) belowTimeframe!: string;

  @Emit('input')
  emitSelectedTimeframe() {
    return this.selectedTimeframe;
  }

  @Watch('value')
  watchValue() {
    this.selectedTimeframe = this.value;
  }

  get availableTimeframes() {
    if (!this.belowTimeframe) {
      return this.availableTimeframesBase;
    }
    const idx = this.availableTimeframesBase.findIndex((v) => v === this.belowTimeframe);

    return [...this.availableTimeframesBase].splice(0, idx);
  }

  // The below list must always remain sorted correctly!
  availableTimeframesBase = [
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
}
</script>

<style scoped></style>
