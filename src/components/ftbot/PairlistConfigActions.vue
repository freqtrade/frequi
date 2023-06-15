<template>
  <div class="d-flex flex-column flex-sm-row mb-2 gap-2">
    <b-button
      title="Save configuration"
      size="sm"
      variant="primary"
      @click="pairlistStore.saveConfig(pairlistStore.config.name)"
    >
      <i-mdi-content-save />
    </b-button>
    <edit-value
      v-model="pairlistStore.config.name"
      editable-name="config"
      :allow-add="true"
      :allow-duplicate="true"
      :allow-edit="true"
      class="d-flex flex-grow-1"
      @delete="pairlistStore.deleteConfig"
      @duplicate="(oldName:string,newName:string) => pairlistStore.duplicateConfig(newName)"
      @new="(name:string) => pairlistStore.newConfig(name)"
      @rename="(oldName: string, newName:string) => pairlistStore.saveConfig(newName)"
    >
      <b-form-select
        v-model="pairlistStore.configName"
        size="sm"
        :options="pairlistStore.savedConfigs.map((c) => c.name)"
        @change="(config) => pairlistStore.selectOrCreateConfig(config)"
      />
    </edit-value>
    <b-button
      title="Evaluate pairlist"
      :disabled="pairlistStore.evaluating || !pairlistStore.pairlistValid"
      variant="primary"
      class="px-5"
      size="sm"
      @click="pairlistStore.startPairlistEvaluation()"
    >
      <b-spinner v-if="pairlistStore.evaluating" small></b-spinner>
      <span>{{ pairlistStore.evaluating ? '' : 'Evaluate' }}</span>
    </b-button>
  </div>
</template>
<script setup lang="ts">
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
import EditValue from '../general/EditValue.vue';
const pairlistStore = usePairlistConfigStore();
</script>
