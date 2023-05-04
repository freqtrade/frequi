<template>
  <b-form-select
    v-model="plotStore.plotConfigName"
    :options="plotStore.availablePlotConfigNames"
    size="sm"
    @change="plotStore.plotConfigChanged"
  >
  </b-form-select>
</template>

<script setup lang="ts">
import { usePlotConfigStore } from '@/stores/plotConfig';

const plotStore = usePlotConfigStore();
</script>

<style scoped></style>
