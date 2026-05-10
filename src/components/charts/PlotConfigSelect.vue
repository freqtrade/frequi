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
    <USelect
      id="plotConfigSelect"
      v-model="plotStore.plotConfigName"
      :items="plotStore.availablePlotConfigNames"
      class="w-full text-left"
      @update:model-value="plotStore.plotConfigChanged"
    >
    </USelect>
  </EditValue>
</template>
