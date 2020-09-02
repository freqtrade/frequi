<template>
  <span>{{ isProfitable ? '&#x1F534;' : '&#x1F7E2;' }}</span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Trade } from '@/types';

//

@Component({})
export default class ProfitSymbol extends Vue {
  @Prop({ required: true }) trade!: Trade;

  get isProfitable() {
    console.log(this.trade);
    const res = (this.trade.close_profit ?? 1) < 0 || (this.trade.current_profit ?? 1) < 0;
    console.log(res);
    return res;
  }
}
</script>

<style scoped></style>
