<template>
  <div class="d-flex">
    <div class="d-flex justify-content-between me-2" :class="classLabel">
      <label>{{ description }}</label>
      <InfoBox v-if="help" :hint="help" />
    </div>
    <div :class="classValue">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  description: { type: String, required: true },
  help: { type: String, default: '', required: false },
  classLabel: { type: String, default: 'col-4 fw-bold mb-0' },
  classValue: { type: String, default: 'col-8' },
});
</script>

<style scoped></style>
