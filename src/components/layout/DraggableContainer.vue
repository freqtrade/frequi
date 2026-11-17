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
  <div class="glass flex flex-col h-full w-full rounded-2xl overflow-hidden">
    <div class="drag-header py-1.5 px-3 border-b border-(--ft-glass-border) bg-white/3">
      <slot name="header">
        <div
          class="flex justify-center items-center gap-2 text-sm font-semibold tracking-wide text-muted uppercase"
        >
          <span class="size-1.5 rounded-full bg-primary accent-glow" aria-hidden="true" />
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
