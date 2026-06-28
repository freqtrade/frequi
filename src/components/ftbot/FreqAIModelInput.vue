<script setup lang="ts">
import type { BacktestFreqAIInput } from '@/types';

const freqAI = defineModel<BacktestFreqAIInput>({ required: true });
</script>

<template>
  <div class="flex justify-end items-center">
    <span class="me-2">Enable FreqAI:</span>
    <InfoBox
      hint="Assumes freqAI configuration is setup in the configuration, and the strategy is a freqAI strategy. Will fail if that's not the case."
    />
  </div>
  <BaseCheckbox id="enable-freqai" v-model="freqAI.enabled"></BaseCheckbox>

  <template v-if="freqAI.enabled">
    <label for="freqai-identifier">FreqAI identifier:</label>
    <UInput
      id="freqai-identifier"
      v-model="freqAI.identifier"
      placeholder="Use config default"
    ></UInput>
  </template>
  <template v-if="freqAI.enabled">
    <label for="freqai-model">FreqAI Model:</label>
    <FreqaiModelSelect id="freqai-model" v-model="freqAI.model"></FreqaiModelSelect>
  </template>
</template>
