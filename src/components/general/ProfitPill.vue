<template>
  <div
    class="d-flex justify-content-between align-items-center profit-pill ps-2 pe-1"
    :class="isProfitable ? 'profit-pill-profit' : ''"
    :title="profitDesc"
  >
    <profit-symbol :profit="(profitRatio || profitAbs) ?? 0" />

    <div class="d-flex justify-content-center align-items-center flex-grow-1">
      {{ profitRatio !== undefined ? formatPercent(profitRatio, 2) : '' }}
      <span
        v-if="profitString"
        class="ms-1"
        :class="profitRatio ? 'small' : ''"
        :title="stakeCurrency"
        >{{ profitString }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPercent, formatPrice, formatPriceCurrency } from '@/shared/formatters';

import { computed } from 'vue';

const props = defineProps({
  profitRatio: { required: false, default: undefined, type: Number },
  profitAbs: { required: false, default: undefined, type: Number },
  stakeCurrency: { required: true, type: String },
  profitDesc: { required: false, default: '', type: String },
});
const isProfitable = computed(() => {
  return (
    (props.profitRatio !== undefined && props.profitRatio > 0) ||
    (props.profitRatio === undefined && props.profitAbs !== undefined && props.profitAbs > 0)
  );
});

const profitString = computed((): string => {
  if (props.profitRatio !== undefined && props.profitAbs !== undefined) {
    return `(${formatPrice(props.profitAbs, 3)})`;
  } else if (props.profitAbs !== undefined) {
    if (props.stakeCurrency !== undefined) {
      return `${formatPriceCurrency(props.profitAbs, props.stakeCurrency, 3)}`;
    } else {
      return `${formatPrice(props.profitAbs, 3)}`;
    }
  }
  return '';
});
</script>

<style scoped lang="scss">
.profit-pill {
  border: 2px solid $color-loss;
  border-radius: 6px;
}
.profit-pill-profit {
  border: 2px solid $color-profit;
}
</style>
