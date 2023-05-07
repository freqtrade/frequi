<template>
  <edit-value
    v-model="plotStore.plotConfigName"
    :allow-edit="allowEdit"
    editable-name="plot configuration"
    @rename="plotStore.renamePlotConfig"
    @delete="plotStore.deletePlotConfig"
    @new="plotStore.newPlotConfig"
  >
    <b-form-select
      v-model="plotStore.plotConfigName"
      :options="plotStore.availablePlotConfigNames"
      size="sm"
      @change="plotStore.plotConfigChanged"
    >
    </b-form-select>
  </edit-value>
</template>

<script setup lang="ts">
import EditValue from '@/components/general/EditValue.vue';
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
