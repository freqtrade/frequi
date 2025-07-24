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
    <div class="flex flex-col grow">
      <label for="selAvailableIndicator" class="form-label">{{ label }}</label>
      <Select
        v-model="selAvailableIndicator"
        :options="columns"
        size="small"
        :clearable="false"
        filter
        auto-filter-focus
      >
      </Select>
    </div>
    <Button size="small" title="Abort" class="ms-1 mt-auto" severity="secondary" @click="abort">
      <template #icon>
        <i-mdi-close />
      </template>
    </Button>
  </div>
</template>
