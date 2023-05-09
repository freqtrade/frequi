<template>
  <div class="d-flex flex-row">
    <b-form-group class="flex-grow-1" :label="label" label-for="indicatorSelector">
      <v-select
        v-model="selAvailableIndicator"
        :options="columns"
        size="sm"
        :clearable="false"
        @option:selected="emitIndicator"
      >
      </v-select>
    </b-form-group>
    <b-button size="sm" title="Abort" class="ms-1 mt-auto" variant="secondary" @click="abort">
      <CloseIcon />
    </b-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import vSelect from 'vue-select';
import CloseIcon from '~icons/mdi/close';

const props = defineProps({
  modelValue: { required: false, default: '', type: String },
  columns: { required: true, type: Array as () => string[] },
  label: { required: true, type: String },
});
const emit = defineEmits(['update:modelValue', 'indicatorSelected']);

const selAvailableIndicator = ref(props.modelValue || '');

function emitIndicator() {
  emit('indicatorSelected', selAvailableIndicator.value);
  emit('update:modelValue', selAvailableIndicator.value);
}
function abort() {
  selAvailableIndicator.value = '';
  emitIndicator();
}
watch(
  () => props.modelValue,
  (newValue) => {
    selAvailableIndicator.value = newValue;
  },
);
</script>

<style scoped></style>
