<template>
  <div class="d-flex flex-row">
    <div class="flex-grow-1">
      <slot v-if="!editing"> </slot>
      <b-form-input v-else v-model="localName" size="sm"> </b-form-input>
    </div>
    <div class="flex-grow-2 mt-auto">
      <template v-if="allowEdit && !(addNew || editing)">
        <b-button
          size="sm"
          class="ms-1"
          variant="secondary"
          :title="`Edit this ${editableName}.`"
          @click="editing = true"
        >
          <EditIcon :size="16" />
        </b-button>
        <b-button
          size="sm"
          class="ms-1"
          variant="secondary"
          :title="`Delete this ${editableName}.`"
          @click="$emit('delete', modelValue)"
        >
          <DeleteIcon :size="16" />
        </b-button>
      </template>
      <b-button
        v-if="allowAdd && !(addNew || editing)"
        size="sm"
        :title="`Add new ${editableName}.`"
        class="ms-1"
        variant="primary"
        @click="addNewClick"
        ><AddIcon :size="16" />
      </b-button>
      <template v-if="addNew || editing">
        <b-button
          size="sm"
          :title="`Add new '${editableName}`"
          class="ms-1"
          variant="primary"
          @click="saveNewName"
        >
          <CheckIcon :size="16" />
        </b-button>
        <b-button size="sm" title="Abort" class="ms-1" variant="secondary" @click="abort">
          <CloseIcon :size="16" />
        </b-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import CheckIcon from 'vue-material-design-icons/Check.vue';
import CloseIcon from 'vue-material-design-icons/Close.vue';
import DeleteIcon from 'vue-material-design-icons/Delete.vue';
import EditIcon from 'vue-material-design-icons/Pencil.vue';
import AddIcon from 'vue-material-design-icons/PlusBoxOutline.vue';

import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  allowEdit: {
    type: Boolean,
    default: false,
  },
  allowAdd: {
    type: Boolean,
    default: false,
  },
  editableName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'delete', value: string): void;
  (e: 'new', value: string): void;
  (e: 'rename', oldName: string, newName: string): void;
}>();

const addNew = ref(false);
const localName = ref<string>(props.modelValue);
const editing = ref<boolean>(false);

function abort() {
  editing.value = false;
  addNew.value = false;
  localName.value = props.modelValue;
}

function addNewClick() {
  localName.value = '';
  addNew.value = true;
  editing.value = true;
}
watch(
  () => props.modelValue,
  () => {
    localName.value = props.modelValue;
  },
);

function saveNewName() {
  editing.value = false;
  if (addNew.value) {
    addNew.value = false;
    emit('new', localName.value);
  } else {
    // Editing
    emit('rename', props.modelValue, localName.value);
  }
}
</script>
