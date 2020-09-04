<template>
  <div class="h-100 d-inline-block">
    <div :class="isProfitable ? 'triangle-up' : 'triangle-down'"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Trade } from '@/types';

@Component({})
export default class ProfitSymbol extends Vue {
  @Prop({ required: true }) trade!: Trade;

  get isProfitable() {
    console.log(this.trade);
    const res = (this.trade.close_profit ?? 0) > 0 || (this.trade.current_profit ?? 0) > 0;
    console.log(res);
    return res;
  }
}
</script>

<style scoped>
.triangle-up {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0.45rem 0.7rem 0.45rem;
  border-color: transparent transparent #00db58 transparent;
}
.triangle-down {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0.7rem 0.45rem 0 0.45rem;
  border-color: #ff0000 transparent transparent transparent;
}
</style>
