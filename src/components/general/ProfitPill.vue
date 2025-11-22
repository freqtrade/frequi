<script setup lang="ts">
const props = defineProps<{
  profitRatio?: number | null;
  profitAbs?: number;
  stakeCurrency: string;
  profitDesc?: string;
}>();
const isProfitable = computed<boolean | null>(() => {
  if (!isDefined(props.profitRatio) && !isDefined(props.profitAbs)) {
    return null;
  }
  return (
    (isDefined(props.profitRatio) && props.profitRatio > 0) ||
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

<template>
  <div
    class="flex justify-between items-center ps-2 pe-1 rounded-sm border-2 border-solid"
    :class="{
      'profit-pill-profit': isProfitable === true,
      'profit-pill': isProfitable === false,
      'border-surface-500': isProfitable === null,
    }"
    :title="profitDesc"
  >
    <ProfitSymbol :profit="profitRatio || profitAbs" />

    <div class="flex justify-center items-center grow">
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

<style scoped lang="css">
.profit-pill {
  border-color: var(--color-loss);
}
.profit-pill-profit {
  border-color: var(--color-profit);
}
</style>
