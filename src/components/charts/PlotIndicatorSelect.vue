<script setup lang="ts">
import VSelect from 'vue-select';

const props = defineProps({
  modelValue: { required: false, default: '', type: String },
  columns: { required: true, type: Array as () => string[] },
  label: { required: true, type: String },
});
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

watch(
  () => props.modelValue,
  (newValue) => {
    selAvailableIndicator.value = newValue;
  },
);
</script>

<template>
  <div class="d-flex flex-row">
    <BFormGroup class="flex-grow-1" :label="label" label-for="indicatorSelector">
      <VSelect
        v-model="selAvailableIndicator"
        :options="columns"
        size="sm"
        :clearable="false"
        @option:selected="emitIndicator"
      >
      </VSelect>
    </BFormGroup>
    <BButton size="sm" title="Abort" class="ms-1 mt-auto" variant="secondary" @click="abort">
      <i-mdi-close />
    </BButton>
  </div>
</template>
