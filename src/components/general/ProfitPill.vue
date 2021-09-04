<template>
  <div
    class="d-flex justify-content-center align-items-center profit-pill px-1"
    :class="isProfitable ? 'profit-pill-profit' : ''"
    :title="profitDesc"
  >
    {{ formatPercent(profitRatio, 2) }}
    <small class="ml-1" :title="stakeCurrency">
      {{ profitRatio ? '(' : '' }}{{ `${formatPrice(profitAbs, 3)}`
      }}{{ profitRatio ? ')' : ` ${stakeCurrency}` }}
    </small>
  </div>
</template>

<script lang="ts">
import { formatPercent, formatPrice, timestampms } from '@/shared/formatters';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class ProfitPill extends Vue {
  @Prop({ required: false, default: undefined, type: Number }) profitRatio?: number;

  @Prop({ required: true, type: Number }) profitAbs!: number;

  @Prop({ required: true, type: String }) stakeCurrency!: string;

  @Prop({ required: false, default: '', type: String }) profitDesc!: string;

  formatPercent = formatPercent;

  timestampms = timestampms;

  formatPrice = formatPrice;

  get isProfitable() {
    return (
      (this.profitRatio !== undefined && this.profitRatio > 0) ||
      (this.profitRatio === undefined && this.profitAbs > 0)
    );
  }
}
</script>

<style scoped lang="scss">
.profit-pill {
  background: $color-loss;
  border-radius: 6px;
}
.profit-pill-profit {
  background: $color-profit;
}
</style>
