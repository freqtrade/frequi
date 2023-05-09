<template>
  <div :title="hint">
    <i-mdi-information-outline />
  </div>
</template>

<script setup>
defineProps({
  hint: { type: String, required: true },
});
</script>

<style lang="scss" scoped></style>
