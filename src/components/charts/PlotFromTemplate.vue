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
    <div v-if="!showIndicatorMapping" class="w-full">
      <label for="selectTemplate">Select Template</label>
      <ListBox
        id="selectTemplate"
        v-model="selTemplateName"
        :options="plotTemplateNames"
        :select-size="4"
      >
      </ListBox>
    </div>
    <div v-else>
      <h5 class="mt-1 text-center text-md mb-1">Re-map indicators</h5>
      <div
        v-for="indicator in Object.keys(indicatorMap)"
        :key="indicator"
        class="flex gap-2 align-center"
      >
        <label :for="`indicator-${indicator}`" class="grow w-full">{{ indicator }}</label>
        <Select
          :id="`indicator-${indicator}`"
          v-model="indicatorMap[indicator]"
          class="grow w-full"
          size="small"
          :options="columns"
        >
        </Select>
      </div>
    </div>
    <div class="mt-2 flex gap-1 justify-end">
      <Button size="small" title="Abort" severity="secondary" @click="visible = false">
        <i-mdi-close />
      </Button>
      <Button
        v-if="!showIndicatorMapping"
        :disabled="!selTemplateName"
        size="small"
        style="width: 33%"
        title="Use template"
        label=" Use Template"
        severity="primary"
        @click="clickStartUseTemplate"
      >
        <template #icon>
          <i-mdi-check class="me-1" />
        </template>
      </Button>
      <Button
        v-if="showIndicatorMapping"
        :disabled="!selTemplateName"
        size="small"
        style="width: 33%"
        title="Apply template"
        severity="primary"
        @click="fromTemplateApply"
      >
        <template #icon>
          <i-mdi-check class="me-1" />
        </template>
        Apply Template
      </Button>
    </div>
  </div>
</template>
