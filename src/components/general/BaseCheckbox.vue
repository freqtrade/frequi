<script setup lang="ts">
withDefaults(defineProps<{ disabled?: boolean }>(), {
  disabled: false,
});
const id = useId();
const value = defineModel<boolean>();
</script>

<template>
  <div>
    <div class="flex items-center">
      <Checkbox v-model="value" binary size="small" :input-id="`input-${id}`">
        <template #icon="{ checked }">
          <i-mdi-check-bold v-if="checked" />
        </template>
      </Checkbox>
      <label :for="`input-${id}`" class="ml-2 text-base"><slot /></label>
    </div>
    <small v-if="$slots.hint" class="block text-surface-600 dark:text-surface-400">
      <slot name="hint"></slot>
    </small>
  </div>
</template>
