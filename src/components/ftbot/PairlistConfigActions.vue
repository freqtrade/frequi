<template>
  <div class="d-flex flex-row mb-2 gap-2">
    <b-button
      title="Delete config"
      :disabled="!pairlistStore.isSavedConfig"
      variant="dark"
      @click="pairlistStore.deleteConfig()"
      ><i-mdi-delete width="24" height="24"
    /></b-button>

    <b-form-input v-model="configName" placeholder="Configuration name..." />

    <b-button-group>
      <b-dropdown variant="dark" title="Saved configs">
        <b-dropdown-item-button
          v-for="config in pairlistStore.savedConfigs"
          :key="config.name"
          @click="pairlistStore.selectConfig(config)"
          >{{ config.name }}</b-dropdown-item-button
        >
      </b-dropdown>
      <b-button
        title="Save config"
        variant="dark"
        :disabled="!configName || pairlistStore.config.pairlists.length == 0"
        @click="pairlistStore.saveConfig(configName)"
        ><i-mdi-content-save width="24" height="24"
      /></b-button>
    </b-button-group>
    <b-button
      title="Clone config"
      variant="dark"
      :disabled="!pairlistStore.config.name || !pairlistStore.isSavedConfig"
      @click="pairlistStore.cloneConfig()"
      ><i-mdi-content-copy width="24" height="24"
    /></b-button>
    <b-button
      title="New config"
      variant="dark"
      :disabled="pairlistStore.config.pairlists.length == 0"
      @click="pairlistStore.newConfig()"
      ><i-mdi-plus width="24" height="24"
    /></b-button>
    <b-button
      title="Evaluate pairlist"
      :disabled="pairlistStore.evaluating || !pairlistStore.pairlistValid"
      variant="primary"
      class="col-lg-2"
      @click="pairlistStore.startPairlistEvaluation()"
    >
      <b-spinner v-if="pairlistStore.evaluating" small></b-spinner>
      <span>{{ pairlistStore.evaluating ? '' : 'Evaluate' }}</span>
    </b-button>
  </div>
</template>
<script setup lang="ts">
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
import { ref, watch } from 'vue';
const pairlistStore = usePairlistConfigStore();

const configName = ref(pairlistStore.config.name);

watch(
  () => pairlistStore.config.name,
  () => {
    configName.value = pairlistStore.config.name;
  },
);
</script>
