<template>
  <b-form-select
    id="timeframe-select"
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

  @Emit('input')
  emitSelectedTimeframe() {
    return this.selectedTimeframe;
  }

  @Watch('value')
  watchValue() {
    this.selectedTimeframe = this.value;
  }

  availableTimeframes = [
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
