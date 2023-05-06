<template>
  <div class="d-flex flex-row">
    <b-form-group class="flex-grow-1" label="Select indicator to add" label-for="indicatorSelector">
      <!--<b-input-group size="sm">
      <b-form-input v-model="indicatorFilter" placeholder="Filter indicators"></b-form-input>
      <b-input-group-append>
        <Reset
          class="pointer align-self-center ms-1"
          :size="18"
          @click="indicatorFilter = ''"
        ></Reset>
      </b-input-group-append>
    </b-input-group>
     <b-form-select
      id="indicatorSelector"
      v-model="selAvailableIndicator"
      :options="filteredIndicators"
      :select-size="4"
      @change="$emit('indicatorSelected', $event)"
    >
    </b-form-select> -->

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
      class="ms-1"
      variant="secondary"
      @click="$emit('indicatorSelected', null)"
    >
      <CloseIcon :size="16" />
    </b-button>
  </div>
</template>

<script setup lang="ts">
// import Reset from 'vue-material-design-icons/CloseCircleOutline.vue';
import { ref } from 'vue';
import vSelect from 'vue-select';
import CloseIcon from 'vue-material-design-icons/Close.vue';

defineProps({
  columns: { required: true, type: Array as () => string[] },
});
const emit = defineEmits(['indicatorSelected']);

const selAvailableIndicator = ref('');
// const indicatorFilter = ref('');
// const filteredIndicators = computed(() => {
//   return props.columns.filter((col) =>
//     col.toLowerCase().includes(indicatorFilter.value.toLowerCase()),
//   );
// });

function emitIndicator() {
  console.log('Emit', selAvailableIndicator.value);
  if (selAvailableIndicator.value) {
    emit('indicatorSelected', selAvailableIndicator.value);
  }
}
</script>

<style scoped></style>
