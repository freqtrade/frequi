<script setup lang="ts">
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
import EditValue from '../general/EditValue.vue';
const pairlistStore = usePairlistConfigStore();
</script>
<template>
  <div class="d-flex flex-column flex-sm-row mb-2 gap-2">
    <BButton
      title="Save configuration"
      size="sm"
      variant="primary"
      @click="pairlistStore.saveConfig(pairlistStore.config.name)"
    >
      <i-mdi-content-save />
    </BButton>
    <EditValue
      v-model="pairlistStore.config.name"
      editable-name="config"
      :allow-add="true"
      :allow-duplicate="true"
      :allow-edit="true"
      class="d-flex flex-grow-1"
      @delete="pairlistStore.deleteConfig"
      @duplicate="(oldName: string, newName: string) => pairlistStore.duplicateConfig(newName)"
      @new="(name: string) => pairlistStore.newConfig(name)"
      @rename="(oldName: string, newName: string) => pairlistStore.saveConfig(newName)"
    >
      <BFormSelect
        v-model="pairlistStore.configName"
        size="sm"
        :options="pairlistStore.savedConfigs.map((c) => c.name)"
        @update:model-value="(config) => pairlistStore.selectOrCreateConfig(config as string)"
      />
    </EditValue>
    <BButton
      title="Evaluate pairlist"
      :disabled="pairlistStore.evaluating || !pairlistStore.pairlistValid"
      variant="primary"
      class="px-5"
      size="sm"
      @click="pairlistStore.startPairlistEvaluation()"
    >
      <BSpinner v-if="pairlistStore.evaluating" small></BSpinner>
      <span>{{ pairlistStore.evaluating ? '' : 'Evaluate' }}</span>
    </BButton>
  </div>
</template>
