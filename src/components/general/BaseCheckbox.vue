<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean }>(), {
  disabled: false,
});
const value = defineModel<boolean>();
</script>

<template>
  <div>
    <div class="flex items-center">
      <UCheckbox v-model="value" binary>
        <template #label><slot /></template>
        <template #description>
          <slot name="hint"></slot>
        </template>
      </UCheckbox>
    </div>
  </div>
</template>
