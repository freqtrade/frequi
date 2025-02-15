<script setup lang="ts">
withDefaults(
  defineProps<{
    header?: string;
  }>(),
  {
    header: '',
  },
);
</script>

<template>
  <div class="h-full w-full border dark:border-surface-800 border-surface-200 rounded">
    <div
      class="drag-header py-1 px-2 dark:bg-surface-800 bg-surface-100 border-b border-surface-500"
    >
      <slot name="header">
        {{ header }}
      </slot>
    </div>
    <div class="p-0 h-full w-full overflow-auto">
      <slot></slot>
    </div>
  </div>
</template>
