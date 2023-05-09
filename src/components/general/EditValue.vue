<template>
  <div class="d-flex flex-row">
    <div class="flex-grow-1">
      <slot v-if="!editing"> </slot>
      <b-form-input v-else v-model="localName" size="sm"> </b-form-input>
    </div>
    <div
      class="flex-grow-2 mt-auto d-flex gap-1 ms-1"
      :class="alignVertical ? 'flex-column' : 'flex-row'"
    >
      <template v-if="allowEdit && !(addNew || editing)">
        <b-button
          size="sm"
          variant="secondary"
          :title="`Edit this ${editableName}.`"
          @click="editing = true"
        >
          <i-mdi-pencil />
        </b-button>
        <b-button
          size="sm"
          variant="secondary"
          :title="`Delete this ${editableName}.`"
          @click="$emit('delete', modelValue)"
        >
          <i-mdi-delete />
        </b-button>
      </template>
      <b-button
        v-if="allowAdd && !(addNew || editing)"
        size="sm"
        :title="`Add new ${editableName}.`"
        variant="primary"
        @click="addNewClick"
        ><i-mdi-plus-box-outline />
      </b-button>
      <template v-if="addNew || editing">
        <b-button
          size="sm"
          :title="`Add new '${editableName}`"
          variant="primary"
          @click="saveNewName"
        >
          <i-mdi-check />
        </b-button>
        <b-button size="sm" title="Abort" class="ms-1" variant="secondary" @click="abort">
          <i-mdi-close />
        </b-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  alignVertical: {
    type: Boolean,
    default: false,
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
