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
    class="flex flex-col h-full w-full border dark:border-neutral-800 border-neutral-200 rounded-sm"
  >
    <div
      class="drag-header py-1 px-2 dark:bg-neutral-800 bg-neutral-100 border-b border-neutral-300 dark:border-neutral-700"
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
