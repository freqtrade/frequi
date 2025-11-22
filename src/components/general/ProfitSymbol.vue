<script setup lang="ts">
const props = defineProps<{
  profit: number | null | undefined;
}>();

const isProfitable = computed<boolean | null>(() => {
  if (!isDefined(props.profit)) {
    return null;
  }
  return props.profit > 0;
});
</script>

<template>
  <div class="d-inline-block">
    <div
      class="triangle"
      :class="{
        'triangle-up': isProfitable === true,
        'triangle-down': isProfitable === false,
        'border-transparent border-t-surface-500': isProfitable === null,
      }"
    ></div>
  </div>
</template>

<style scoped lang="css">
.triangle {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0.7rem 0.45rem 0 0.45rem;
}
.triangle-up {
  border-width: 0 0.45rem 0.7rem 0.45rem;
  border-color: transparent transparent var(--color-profit) transparent;
}
.triangle-down {
  border-width: 0.7rem 0.45rem 0 0.45rem;
  border-color: var(--color-loss) transparent transparent transparent;
}
</style>
