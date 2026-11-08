<script setup lang="ts">
import type { BacktestFreqAIInput } from '@/types';

const freqAI = defineModel<BacktestFreqAIInput>({ required: true });
</script>

<template>
  <div class="flex flex-col gap-3">
    <USwitch
      id="enable-freqai"
      v-model="freqAI.enabled"
      label="Enable FreqAI"
      description="Requires FreqAI to be configured and a FreqAI strategy. Will fail otherwise."
    />
    <div
      v-if="freqAI.enabled"
      class="grid grid-cols-1 sm:grid-cols-2 gap-2 ms-4 ps-4 border-s-2 border-default"
    >
      <UFormField label="Identifier">
        <UInput
          id="freqai-identifier"
          v-model="freqAI.identifier"
          placeholder="Use config default"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Model">
        <FreqaiModelSelect id="freqai-model" v-model="freqAI.model" />
      </UFormField>
    </div>
  </div>
</template>
