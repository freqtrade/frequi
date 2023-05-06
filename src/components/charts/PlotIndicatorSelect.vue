<template>
  <div class="d-flex flex-row">
    <b-form-group class="flex-grow-1" label="Select indicator to add" label-for="indicatorSelector">
      <v-select
        v-model="selAvailableIndicator"
        :options="columns"
        size="sm"
        :clearable="false"
        @option:selected="emitIndicator"
      >
      </v-select>
    </b-form-group>
    <b-button
      size="sm"
      title="Abort"
      class="ms-1 mt-auto"
      variant="secondary"
      @click="$emit('indicatorSelected', null)"
    >
      <CloseIcon :size="16" />
    </b-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import vSelect from 'vue-select';
import CloseIcon from 'vue-material-design-icons/Close.vue';

defineProps({
  columns: { required: true, type: Array as () => string[] },
});
const emit = defineEmits(['indicatorSelected']);

const selAvailableIndicator = ref('');

function emitIndicator() {
  if (selAvailableIndicator.value) {
    emit('indicatorSelected', selAvailableIndicator.value);
  }
}
</script>

<style scoped></style>
