<template>
  <div class="h-100 d-inline-block">
    <div :class="isProfitable ? 'triangle-up' : 'triangle-down'"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({})
export default class ProfitSymbol extends Vue {
  @Prop({ required: true, type: Number }) profit!: number;

  get isProfitable() {
    return this.profit > 0;
  }
}
</script>

<style scoped lang="scss">
.triangle-up {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0.45rem 0.7rem 0.45rem;
  border-color: transparent transparent $color-profit transparent;
}
.triangle-down {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0.7rem 0.45rem 0 0.45rem;
  border-color: $color-loss transparent transparent transparent;
}
</style>
