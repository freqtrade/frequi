<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    class?: string;
    unmountOnHide?: boolean;
  }>(),
  {
    title: '',
    size: 'lg',
    class: '',
    unmountOnHide: true,
  },
);
const open = defineModel('open', {
  type: Boolean,
  default: false,
});
defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <UCollapsible
    class="border border-neutral-300 dark:border-neutral-700 rounded-sm"
    v-model:open="open"
    :unmount-on-hide
  >
    <UButton
      block
      :size="size"
      color="neutral"
      variant="ghost"
      class="group font-bold"
      trailing-icon="mdi:chevron-down"
      :ui="{
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    >
      <slot name="title" :open="open">
        {{ title }}
      </slot>
    </UButton>
    <template #content>
      <div :class="props.class">
        <slot />
      </div>
    </template>
  </UCollapsible>
</template>
