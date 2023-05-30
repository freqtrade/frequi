<template>
  <b-input-group class="mb-2">
    <template #prepend>
      <b-button
        :disabled="!pairlistStore.config.name"
        variant="danger"
        @click="pairlistStore.deleteConfig()"
        ><i-mdi-close class="fs-4"
      /></b-button>
      <b-dropdown text="Configs">
        <b-dropdown-item
          v-for="config in pairlistStore.savedConfigs"
          :key="config.name"
          @click="pairlistStore.selectConfig(config)"
          >{{ config.name }}</b-dropdown-item
        >
      </b-dropdown>
      <b-button :disabled="!pairlistStore.config.name" @click="pairlistStore.saveConfig()"
        ><i-mdi-content-save class="fs-4"
      /></b-button>
      <b-button
        :disabled="pairlistStore.config.pairlists.length == 0"
        @click="pairlistStore.newConfig()"
        ><i-mdi-plus class="fs-4"
      /></b-button>
    </template>

    <b-form-input v-model="pairlistStore.config.name" placeholder="Configuration name..." />

    <template #append>
      <b-button
        :disabled="pairlistStore.evaluating || !pairlistStore.pairlistValid"
        variant="primary"
        size="lg"
        squared
        class="evaluate"
        @click="pairlistStore.startPairlistEvaluation()"
      >
        <b-spinner v-if="pairlistStore.evaluating" small></b-spinner>
        <span>{{ pairlistStore.evaluating ? 'Evaluating...' : 'Evaluate' }}</span>
      </b-button>
    </template>
  </b-input-group>
</template>
<script setup>
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
const pairlistStore = usePairlistConfigStore();
</script>
