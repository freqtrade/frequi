<template>
  <EditValue
    v-model="plotStore.plotConfigName"
    :allow-edit="allowEdit"
    :allow-add="allowEdit"
    :allow-duplicate="allowEdit"
    editable-name="plot configuration"
    @rename="plotStore.renamePlotConfig"
    @delete="plotStore.deletePlotConfig"
    @new="plotStore.newPlotConfig"
    @duplicate="plotStore.duplicatePlotConfig"
  >
    <b-form-select
      v-model="plotStore.plotConfigName"
      :options="plotStore.availablePlotConfigNames"
      size="sm"
      @change="plotStore.plotConfigChanged"
    >
    </b-form-select>
  </EditValue>
</template>

<script setup lang="ts">
import { usePlotConfigStore } from '@/stores/plotConfig';

defineProps({
  allowEdit: {
    type: Boolean,
    default: false,
  },
  editableName: {
    type: String,
    default: 'plot configuration',
  },
});
const plotStore = usePlotConfigStore();
</script>

<style scoped></style>
