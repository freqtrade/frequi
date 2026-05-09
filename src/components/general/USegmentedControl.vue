<script
  setup
  lang="ts"
  generic="
    T extends string | number | boolean | object,
    VK extends GetItemKeys<T> | undefined = undefined
  "
>
import type { GetItemKeys, GetItemValue } from '@nuxt/ui';

/**
 * SegmentedControl — NuxtUI replacement for PrimeVue SelectButton.
 * Uses UFieldGroup + UButton internally.
 */
const props = withDefaults(
  defineProps<{
    items: T[];
    labelKey?: GetItemKeys<T>;
    valueKey?: VK;
    allowEmpty?: boolean;
    disabledKey?: GetItemKeys<T>;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  {
    allowEmpty: false,
    size: 'sm',
  },
);

const modelValue = defineModel<GetItemValue<T, VK>>();

function asRecord(item: T): Record<string, unknown> | null {
  if (typeof item === 'object' && item !== null) {
    return item as Record<string, unknown>;
  }

  return null;
}

function getRecordValue(record: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((value, segment) => {
    if (typeof value === 'object' && value !== null) {
      return (value as Record<string, unknown>)[segment];
    }

    return undefined;
  }, record);
}

function getLabel(item: T): string {
  const record = asRecord(item);

  if (record) {
    return String(
      (props.labelKey ? getRecordValue(record, props.labelKey) : undefined) ?? record.label ?? item,
    );
  }

  return String(item);
}

function getValue(item: T): GetItemValue<T, VK> {
  const record = asRecord(item);

  if (record && props.valueKey) {
    return getRecordValue(record, props.valueKey) as GetItemValue<T, VK>;
  }

  return item as GetItemValue<T, VK>;
}

function isSelected(item: T): boolean {
  return modelValue.value === getValue(item);
}

function isDisabled(item: T): boolean {
  const record = asRecord(item);

  if (record && props.disabledKey) {
    return !!getRecordValue(record, props.disabledKey);
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
