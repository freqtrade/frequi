<script setup lang="ts">
defineProps({
  description: { type: String, required: true },
  help: { type: String, default: '', required: false },
  classLabel: { type: String, default: 'w-4/12 font-bold mb-0' },
  classValue: { type: String, default: 'w-8/12' },
});
</script>

<template>
  <div class="flex w-full">
    <div class="flex justify-between me-2" :class="classLabel">
      <label>{{ description }}</label>
      <InfoBox v-if="help" :hint="help" />
    </div>
    <div :class="classValue">
      <slot></slot>
    </div>
  </div>
</template>
