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

<script lang="ts">
import { formatPercent, formatPrice } from '@/shared/formatters';

import ProfitSymbol from '@/components/general/ProfitSymbol.vue';

import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ProfitPill',
  components: { ProfitSymbol },
  props: {
    profitRatio: { required: false, default: undefined, type: Number },
    profitAbs: { required: false, default: undefined, type: Number },
    stakeCurrency: { required: true, type: String },
    profitDesc: { required: false, default: '', type: String },
  },
  setup(props) {
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
        return `${formatPrice(props.profitAbs, 3)}`;
      }
      return '';
    });
    return { profitString, isProfitable, formatPercent };
  },
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
