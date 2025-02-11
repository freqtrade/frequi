<script setup lang="ts">
defineProps({
  disabled: Boolean,
});
const id = useId();
const value = defineModel();
</script>

<template>
  <div>
    <div class="flex items-center">
      <Checkbox v-model="value" binary size="small" :input-id="`input-${id}`" />
      <label :for="`input-${id}`" class="ml-2 text-base"><slot /></label>
    </div>
    <small v-if="$slots.hint" class="text-xs block text-surface-600 dark:text-surface-400">
      <slot name="hint"></slot>
    </small>
  </div>
</template>
