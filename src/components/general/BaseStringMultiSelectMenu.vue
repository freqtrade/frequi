<script setup lang="ts">
import { ComboboxInput } from 'reka-ui';

const props = withDefaults(
  defineProps<{
    items: string[];
    placeholder?: string;
    searchPlaceholder?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    virtualize?: boolean | Record<string, unknown>;
  }>(),
  {
    placeholder: 'Select items',
    searchPlaceholder: 'Search...',
    size: 'md',
    virtualize: false,
  },
);

const modelValue = defineModel<string[]>({ required: true });

const searchTerm = ref('');

const filteredItems = computed(() => {
  const normalizedSearch = searchTerm.value.trim().toLowerCase();

  if (!normalizedSearch) {
    return props.items;
  }

  return props.items.filter((item) => item.toLowerCase().includes(normalizedSearch));
});

const allFilteredItemsSelected = computed(() => {
  if (filteredItems.value.length === 0) {
    return false;
  }

  return filteredItems.value.every((item) => modelValue.value.includes(item));
});

function toggleFilteredItems() {
  if (filteredItems.value.length === 0) {
    return;
  }

  if (allFilteredItemsSelected.value) {
    modelValue.value = modelValue.value.filter((item) => !filteredItems.value.includes(item));
    return;
  }

  modelValue.value = [...new Set([...modelValue.value, ...filteredItems.value])];
}
</script>

<template>
  <USelectMenu
    v-model="modelValue"
    v-model:search-term="searchTerm"
    multiple
    :items="items"
    :placeholder="placeholder"
    :search-input="false"
    :size="size"
    :virtualize="virtualize"
  >
    <template #content-top>
      <div class="flex items-center gap-2 border-b border-default">
        <ComboboxInput v-model="searchTerm" :display-value="() => searchTerm" as-child>
          <UInput
            autofocus
            autocomplete="off"
            class="w-full"
            :placeholder="searchPlaceholder"
            :size="size"
            data-slot="input"
            variant="none"
            @change.stop
          />
        </ComboboxInput>
        <UButton
          color="neutral"
          variant="ghost"
          :disabled="filteredItems.length === 0"
          @click.stop="toggleFilteredItems"
          icon="mdi:check"
        />
      </div>
    </template>
  </USelectMenu>
</template>
