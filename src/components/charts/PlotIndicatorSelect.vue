<template>
  <b-form-group label="Add indicator" label-for="indicatorSelector">
    <b-input-group size="sm">
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
    </b-form-select>
  </b-form-group>
</template>

<script setup lang="ts">
import Reset from 'vue-material-design-icons/CloseCircleOutline.vue';
import { computed, ref } from 'vue';

const props = defineProps({
  columns: { required: true, type: Array as () => string[] },
});
defineEmits(['indicatorSelected']);

const selAvailableIndicator = ref('');
const indicatorFilter = ref('');
const filteredIndicators = computed(() => {
  return props.columns.filter((col) =>
    col.toLowerCase().includes(indicatorFilter.value.toLowerCase()),
  );
});
</script>

<style scoped></style>
