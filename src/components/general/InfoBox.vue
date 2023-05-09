<template>
  <div :title="hint">
    <InfoIcon />
  </div>
</template>

<script setup>
import InfoIcon from '~icons/mdi/information-outline';
defineProps({
  hint: { type: String, required: true },
});
</script>

<style lang="scss" scoped></style>
