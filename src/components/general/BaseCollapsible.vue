<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  {
    size: 'lg',
  },
);
</script>

<template>
  <UCollapsible class="border border-neutral-300 dark:border-neutral-700 rounded-sm">
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
      :label="title"
    />
    <template #content>
      <slot />
    </template>
  </UCollapsible>
</template>
