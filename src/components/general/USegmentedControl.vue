<script setup lang="ts" generic="T extends string | number | boolean | object">
/**
 * SegmentedControl — NuxtUI replacement for PrimeVue SelectButton.
 * Uses UFieldGroup + UButton internally.
 */
const props = withDefaults(
  defineProps<{
    items: T[];
    labelKey?: string;
    valueKey?: string;
    allowEmpty?: boolean;
    disabledKey?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  {
    labelKey: 'label',
    valueKey: 'value',
    allowEmpty: false,
    size: 'sm',
  },
);

const modelValue = defineModel<any>();

function getLabel(item: T): string {
  if (typeof item === 'object' && item !== null) {
    return String((item as any)[props.labelKey] ?? (item as any)['label'] ?? item);
  }
  return String(item);
}

function getValue(item: T): any {
  if (typeof item === 'object' && item !== null) {
    return (item as any)[props.valueKey] ?? item;
  }
  return item;
}

function isSelected(item: T): boolean {
  return modelValue.value === getValue(item);
}

function isDisabled(item: T): boolean {
  if (props.disabledKey) {
    if (typeof item === 'object' && item !== null) {
      return !!item[props.disabledKey];
    }
  }
  return false;
}

function select(item: T) {
  const val = getValue(item);
  if (!props.allowEmpty && isSelected(item)) {
    return; // Do not allow deselect when allowEmpty is false
  }
  modelValue.value = isSelected(item) ? undefined : val;
}
</script>

<template>
  <UFieldGroup>
    <UButton
      v-for="item in items"
      :key="String(getValue(item))"
      :size="size"
      :variant="isSelected(item) ? 'solid' : 'subtle'"
      :color="isSelected(item) ? 'primary' : 'neutral'"
      :aria-pressed="isSelected(item)"
      :disabled="isDisabled(item)"
      @click="select(item)"
    >
      {{ getLabel(item) }}
    </UButton>
  </UFieldGroup>
</template>
