<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    columns: string[];
    label: string;
  }>(),
  {
    modelValue: '',
  },
);
const emit = defineEmits<{
  'update:modelValue': [value: string];
  indicatorSelected: [value: string];
}>();

const selAvailableIndicator = ref('');

function emitIndicator() {
  emit('indicatorSelected', selAvailableIndicator.value);
  emit('update:modelValue', selAvailableIndicator.value);
}
function abort() {
  selAvailableIndicator.value = '';
  emitIndicator();
}

onMounted(() => {
  selAvailableIndicator.value = props.modelValue;
});

watch(selAvailableIndicator, () => {
  emitIndicator();
});

watch(
  () => props.modelValue,
  (newValue) => {
    selAvailableIndicator.value = newValue;
  },
);
</script>

<template>
  <div class="flex flex-row">
    <UFormField :label class="grow">
      <USelectMenu
        v-model="selAvailableIndicator"
        :items="columns"
        :clearable="false"
        filter
        class="w-full"
        auto-filter-focus
      >
      </USelectMenu>
    </UFormField>
    <UButton title="Abort" class="ms-1 mt-auto" color="neutral" icon="mdi:close" @click="abort" />
  </div>
</template>
