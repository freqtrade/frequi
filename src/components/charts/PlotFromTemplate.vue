<script setup lang="ts">
const { plotTemplateNames, applyPlotTemplate } = usePlotTemplates();

const visible = defineModel<boolean>('visible');

const plotStore = usePlotConfigStore();

function fromTemplateApply() {
  if (selTemplateName.value) {
    plotStore.editablePlotConfig = {
      ...applyPlotTemplate(selTemplateName.value, plotStore.editablePlotConfig),
    };
    visible.value = false;
  }
}
const selTemplateName = ref<string>('');
watch(
  () => visible.value,
  (v) => {
    if (v) {
      selTemplateName.value = '';
    }
  },
);
</script>

<template>
  <div v-if="visible" class="pt-1">
    <BFormGroup label="Select Templates" label-for="selectTemplate">
      <BFormSelect
        id="selectTemplate"
        v-model="selTemplateName"
        :options="plotTemplateNames"
        :select-size="4"
      >
      </BFormSelect>
    </BFormGroup>
    <div class="mt-2 d-flex gap-1 justify-content-end">
      <BButton size="sm" title="Abort" variant="secondary" @click="visible = false">
        <i-mdi-close />
      </BButton>
      <BButton
        :disabled="!selTemplateName"
        size="sm"
        title="Apply template"
        variant="primary"
        @click="fromTemplateApply"
      >
        <i-mdi-check class="me-1" />Apply Template
      </BButton>
    </div>
  </div>
</template>
