<template>
  <div class="h-100">
    <b-button-group class="py-3">
      <b-button
        v-model="currentView"
        :active="currentView === 'configurator'"
        @click="currentView = 'configurator'"
        >Configurator</b-button
      >
      <b-button
        v-model="currentView"
        :disabled="pairlistStore.whitelist.length == 0"
        :active="currentView === 'results'"
        @click="currentView = 'results'"
        >Results</b-button
      >
    </b-button-group>

    <PairlistConfigurator v-if="currentView == 'configurator'" />

    <PairlistConfigResults v-show="currentView == 'results'" />
  </div>
</template>

<script setup lang="ts">
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
import { ref, watch } from 'vue';
import PairlistConfigurator from '@/components/ftbot/PairlistConfigurator.vue';
import PairlistConfigResults from '@/components/ftbot/PairlistConfigResults.vue';

const pairlistStore = usePairlistConfigStore();
const currentView = ref<'configurator' | 'results'>('configurator');

watch(
  () => pairlistStore.evaluating,
  (newVal: boolean, oldVal: boolean) => {
    if (oldVal === true && newVal === false) {
      currentView.value = 'results';
    }
  },
);
</script>
