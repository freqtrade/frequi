<template>
  <div class="d-inline-block">
    <div :class="isProfitable ? 'triangle-up' : 'triangle-down'"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ProfitSymbol',
  props: {
    profit: { type: Number, required: true },
  },
  setup(props) {
    const isProfitable = computed(() => {
      return props.profit > 0;
    });
    return {
      isProfitable,
    };
  },
});
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
