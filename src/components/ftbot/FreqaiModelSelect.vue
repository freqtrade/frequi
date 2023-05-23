<template>
  <div>
    <div class="w-100 d-flex">
      <b-form-select
        id="freqaiModel-select"
        v-model="locFreqaiModel"
        :options="botStore.activeBot.freqaiModelList"
      >
      </b-form-select>
      <div class="ms-2">
        <b-button @click="botStore.activeBot.getFreqAIModelList">
          <i-mdi-refresh />
        </b-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { computed, onMounted } from 'vue';

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

<style></style>
