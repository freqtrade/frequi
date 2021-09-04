<template>
  <div
    class="profit-pill px-2"
    :class="profitRatio > 0 ? 'profit-pill-profit' : ''"
    :title="profitDesc"
  >
    {{ formatPercent(profitRatio, 2) }}
    <small :title="stakeCurrency">
      {{ `(${formatPrice(profitAbs, 3)} ${stakeCurrency})` }}
    </small>
  </div>
</template>

<script lang="ts">
import { formatPercent, formatPrice, timestampms } from '@/shared/formatters';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class ProfitPill extends Vue {
  @Prop({ required: true, type: Number }) profitRatio!: number;

  @Prop({ required: true, type: Number }) profitAbs!: number;

  @Prop({ required: true, type: String }) stakeCurrency!: string;

  @Prop({ required: true, type: String }) profitDesc!: string;

  formatPercent = formatPercent;

  timestampms = timestampms;

  formatPrice = formatPrice;
}
</script>

<style scoped lang="scss">
.profit-pill {
  background: #ef5350;
  border-radius: 6px;
}
.profit-pill-profit {
  background: #12bb7b;
}
</style>
