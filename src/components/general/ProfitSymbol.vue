<script setup lang="ts">
const props = defineProps<{
  profit: number;
}>();

const isProfitable = computed(() => {
  return props.profit > 0;
});
</script>

<template>
  <div class="d-inline-block">
    <div :class="isProfitable ? 'triangle-up' : 'triangle-down'"></div>
  </div>
</template>

<style scoped lang="css">
.triangle-up {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0.45rem 0.7rem 0.45rem;
  border-color: transparent transparent var(--color-profit) transparent;
}
.triangle-down {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0.7rem 0.45rem 0 0.45rem;
  border-color: var(--color-loss) transparent transparent transparent;
}
</style>
