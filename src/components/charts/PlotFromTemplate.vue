<script setup lang="ts">
const visible = defineModel<boolean>('visible');
defineProps<{
  columns: string[];
}>();

const { plotTemplateNames, applyPlotTemplate, getTemplateContent } = usePlotTemplates();
const plotStore = usePlotConfigStore();

function fromTemplateApply() {
  if (selTemplateName.value) {
    plotStore.editablePlotConfig = {
      ...applyPlotTemplate(selTemplateName.value, plotStore.editablePlotConfig, indicatorMap.value),
    };
    visible.value = false;
  }
}

function clickStartUseTemplate() {
  showIndicatorMapping.value = !showIndicatorMapping.value;

  indicatorMap.value = plotConfigColumns(getTemplateContent(selTemplateName.value)).reduce(
    (acc, indicator) => {
      acc[indicator] = indicator;
      return acc;
    },
    {},
  );
}

const selTemplateName = ref<string>('');
watch(
  () => visible.value,
  (v) => {
    if (v) {
      selTemplateName.value = '';
      showIndicatorMapping.value = false;
    }
  },
);

const indicatorMap = ref<Record<string, string>>({});
const showIndicatorMapping = ref(false);
</script>

<template>
  <div v-if="visible" class="pt-1">
    <BFormGroup v-if="!showIndicatorMapping" label="Select Templates" label-for="selectTemplate">
      <BFormSelect
        id="selectTemplate"
        v-model="selTemplateName"
        :options="plotTemplateNames"
        :select-size="4"
      >
      </BFormSelect>
    </BFormGroup>
    <div v-else>
      <h5 class="mt-1 text-center">Re-map indicators</h5>
      <div v-for="indicator in Object.keys(indicatorMap)" :key="indicator">
        <div class="d-flex gap-2 align-items-center">
          <span class="flex-grow-1 w-100">{{ indicator }}</span>
          <BFormSelect
            :id="`indicator-${indicator}`"
            v-model="indicatorMap[indicator]"
            class="flex-grow-1 w-100"
            :options="columns"
          >
          </BFormSelect>
        </div>
      </div>
    </div>
    <div class="mt-2 d-flex gap-1 justify-content-end">
      <BButton size="sm" title="Abort" variant="secondary" @click="visible = false">
        <i-mdi-close />
      </BButton>
      <BButton
        v-if="!showIndicatorMapping"
        :disabled="!selTemplateName"
        size="sm"
        style="width: 33%"
        title="Use template"
        variant="primary"
        @click="clickStartUseTemplate"
      >
        <i-mdi-check class="me-1" />Use Template
      </BButton>
      <BButton
        v-if="showIndicatorMapping"
        :disabled="!selTemplateName"
        size="sm"
        style="width: 33%"
        title="Apply template"
        variant="primary"
        @click="fromTemplateApply"
      >
        <i-mdi-check class="me-1" />Apply Template
      </BButton>
    </div>
  </div>
</template>
