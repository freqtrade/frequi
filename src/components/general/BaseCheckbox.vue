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
      <label :for="`input-${id}`" class="ml-2"><slot /></label>
    </div>
    <small v-if="$slots.hint" class="block text-gray-600">
      <slot name="hint"></slot>
    </small>
  </div>
</template>
