<template>
  <div>
    <div class="w-100 d-flex">
      <BFormSelect
        id="freqaiModel-select"
        v-model="locFreqaiModel"
        :options="botStore.activeBot.freqaiModelList"
      >
      </BFormSelect>
      <div class="ms-2">
        <BButton @click="botStore.activeBot.getFreqAIModelList">
          <i-mdi-refresh />
        </BButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

const props = defineProps({
  modelValue: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue']);
const botStore = useBotStore();

const locFreqaiModel = computed({
  get() {
    return props.modelValue;
  },
  set(freqaiModel: string) {
    emit('update:modelValue', freqaiModel);
  },
});

onMounted(() => {
  if (botStore.activeBot.freqaiModelList.length === 0) {
    botStore.activeBot.getFreqAIModelList();
  }
});
</script>
