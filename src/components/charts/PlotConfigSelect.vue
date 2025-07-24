<script setup lang="ts">
withDefaults(
  defineProps<{
    allowEdit?: boolean;
    editableName?: string;
  }>(),
  {
    allowEdit: false,
    editableName: 'plot configuration',
  },
);
const plotStore = usePlotConfigStore();
</script>

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
    <Select
      id="plotConfigSelect"
      v-model="plotStore.plotConfigName"
      :options="plotStore.availablePlotConfigNames"
      class="w-full text-left"
      size="small"
      @update:model-value="plotStore.plotConfigChanged"
    >
    </Select>
  </EditValue>
</template>
