<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
withDefaults(
  defineProps<{
    header?: string;
    contentOverflow?: 'auto' | 'hidden' | 'visible';
  }>(),
  {
    header: '',
    contentOverflow: 'auto',
  },
);
</script>

<template>
  <div
    class="flex flex-col h-full w-full min-w-0 overflow-hidden border border-surface-200 bg-white shadow-sm dark:border-surface-800/80 dark:bg-[#090d14] dark:shadow-none rounded-lg"
  >
    <div
      class="drag-header min-h-8 py-1.5 px-3 bg-surface-100/90 text-sm font-medium tracking-wide text-surface-700 border-b border-surface-200 dark:bg-[#101722] dark:text-surface-200 dark:border-surface-800/90"
    >
      <slot name="header">
        {{ header }}
      </slot>
    </div>
    <div
      class="p-0 w-full"
      :class="{
        'h-full overflow-auto': contentOverflow === 'auto',
        'h-full overflow-hidden': contentOverflow === 'hidden',
        'h-auto overflow-visible': contentOverflow === 'visible',
      }"
      v-bind="$attrs"
    >
      <slot></slot>
    </div>
  </div>
</template>
