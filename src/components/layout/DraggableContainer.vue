<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
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
  <div
    class="flex flex-col h-full w-full border dark:border-surface-800 border-surface-200 rounded-sm"
  >
    <div
      class="drag-header py-1 px-2 dark:bg-surface-800 bg-surface-100 border-b border-surface-300 dark:border-surface-700"
    >
      <slot name="header">
        {{ header }}
      </slot>
    </div>
    <div class="p-0 h-full w-full overflow-auto" v-bind="$attrs">
      <slot></slot>
    </div>
  </div>
</template>
