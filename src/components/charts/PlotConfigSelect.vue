<template>
  <div class="d-flex flex-row">
    <b-form-select
      v-if="!editing"
      v-model="plotStore.plotConfigName"
      :options="plotStore.availablePlotConfigNames"
      size="sm"
      @change="plotStore.plotConfigChanged"
    >
    </b-form-select>
    <b-form-input v-else id="idPlotConfigName" v-model="plotName" size="sm"> </b-form-input>

    <template v-if="allowEdit && !(addNew || editing)">
      <b-button
        size="sm"
        class="ms-1"
        variant="secondary"
        title="Edit this plot configuration"
        @click="editing = true"
      >
        <EditIcon :size="16" />
      </b-button>
      <b-button
        size="sm"
        class="ms-1"
        variant="secondary"
        title="Delete this plot configuration"
        @click="plotStore.deletePlotConfig(plotStore.plotConfigName)"
      >
        <DeleteIcon :size="16" />
      </b-button>
      <b-button size="sm" title="Add new config" class="ms-1" variant="primary" @click="addNewClick"
        ><AddIcon :size="16" />
      </b-button>
    </template>
    <template v-if="allowEdit && (addNew || editing)">
      <b-button
        size="sm"
        title="Add new Plot configuration"
        class="ms-1"
        variant="primary"
        @click="saveNewName"
      >
        <CheckIcon :size="16" />
      </b-button>
      <b-button size="sm" title="Abort" class="ms-1" variant="secondary">
        <CloseIcon :size="16" @click="abort" />
      </b-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import CheckIcon from 'vue-material-design-icons/Check.vue';
import { usePlotConfigStore } from '@/stores/plotConfig';
import EditIcon from 'vue-material-design-icons/Pencil.vue';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import AddIcon from 'vue-material-design-icons/PlusBoxOutline.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';

import { ref } from 'vue';

defineProps({
  allowEdit: {
    type: Boolean,
    default: false,
  },
});
const plotStore = usePlotConfigStore();
const addNew = ref(false);
const plotName = ref<string>(plotStore.plotConfigName);
const editing = ref<boolean>(false);

function abort() {
  editing.value = false;
  addNew.value = false;
  plotName.value = plotStore.plotConfigName;
}

function addNewClick() {
  plotName.value = '';
  addNew.value = true;
  editing.value = true;
}

function saveNewName() {
  editing.value = false;
  if (addNew.value) {
    addNew.value = false;
    plotStore.newPlotConfig(plotName.value);
  } else {
    // Editing
    plotStore.renamePlotConfig(plotStore.plotConfigName, plotName.value);
  }
}
</script>

<style scoped></style>
