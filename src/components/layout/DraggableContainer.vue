<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
withDefaults(
  defineProps<{
    /** The header text for the draggable container */
    header?: string;
    /** The info text for the draggable container
     * Only shown when hovering the info icon next to the header. Used to give more context about the content of the container.
     * Not compatible with usage of the header slot.
     */
    infoText?: string;
  }>(),
  {
    header: '',
    infoText: '',
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
        <div class="flex justify-center items-center gap-2">
          {{ header }}
          <InfoBox v-if="infoText" :hint="infoText" />
        </div>
      </slot>
    </div>
    <div class="p-0 h-full w-full overflow-auto" v-bind="$attrs">
      <slot></slot>
    </div>
  </div>
</template>
