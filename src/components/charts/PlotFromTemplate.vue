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
    <UFormField v-if="!showIndicatorMapping" label="Select Template" class="text-md">
      <UCommandPalette
        id="selectTemplate"
        class="rounded ring ring-accented"
        :input="false"
        v-model="selTemplateName"
        value-key="value"
        :groups="[
          {
            id: 'templates',
            items: plotTemplateNames.map((name) => ({
              value: name,
              label: name,
            })),
          },
        ]"
      >
      </UCommandPalette>
    </UFormField>
    <div v-else>
      <h5 class="mt-1 text-center text-md mb-1">Re-map indicators</h5>
      <div
        v-for="indicator in Object.keys(indicatorMap)"
        :key="indicator"
        class="flex gap-2 align-center"
      >
        <label :for="`indicator-${indicator}`" class="grow w-full">{{ indicator }}</label>
        <USelectMenu
          :id="`indicator-${indicator}`"
          v-model="indicatorMap[indicator]"
          class="grow w-full"
          :items="columns"
        >
        </USelectMenu>
      </div>
    </div>
    <div class="mt-2 flex gap-1 justify-end">
      <UButton size="sm" title="Abort" color="neutral" icon="mdi:close" @click="visible = false" />
      <UButton
        v-if="!showIndicatorMapping"
        :disabled="!selTemplateName"
        size="sm"
        style="width: 33%"
        title="Use template"
        label=" Use Template"
        icon="mdi:check"
        @click="clickStartUseTemplate"
      />
      <UButton
        v-if="showIndicatorMapping"
        :disabled="!selTemplateName"
        size="sm"
        style="width: 33%"
        title="Apply template"
        icon="mdi:check"
        @click="fromTemplateApply"
        label="Apply Template"
      />
    </div>
  </div>
</template>
