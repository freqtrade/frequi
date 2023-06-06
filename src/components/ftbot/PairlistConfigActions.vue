<template>
  <div class="d-flex mb-2 gap-2">
    <edit-value
      v-model="pairlistStore.config.name"
      editable-name="config"
      :allow-add="true"
      :allow-duplicate="true"
      :allow-edit="true"
      class="d-flex flex-grow-1"
      @delete="pairlistStore.deleteConfig"
      @duplicate="(oldName:string,newName:string) => pairlistStore.duplicateConfig(oldName, newName)"
      @new="(name:string) => pairlistStore.newConfig(name)"
      @rename="(oldName: string, newName:string) => pairlistStore.renameOrSaveConfig(oldName,newName)"
    >
      <b-form-select
        v-model="pairlistStore.config"
        size="sm"
        :options="
          pairlistStore.savedConfigs.map((c) => {
            return { text: c.name, value: c };
          })
        "
      />
    </edit-value>
    <b-button
      title="Evaluate pairlist"
      :disabled="pairlistStore.evaluating || !pairlistStore.pairlistValid"
      variant="primary"
      class="col-lg-2"
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
