<script setup lang="ts">
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
  allowDuplicate: {
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
  delete: [value: string];
  new: [value: string];
  duplicate: [oldName: string, newName: string];
  rename: [oldName: string, newName: string];
}>();

enum EditState {
  None,
  Editing,
  Adding,
  Duplicating,
}

const localName = ref<string>('');
const mode = ref<EditState>(EditState.None);
onMounted(() => {
  localName.value = props.modelValue;
});

function abort() {
  mode.value = EditState.None;
  localName.value = props.modelValue;
}

function duplicate() {
  localName.value = localName.value + ' (copy)';
  mode.value = EditState.Duplicating;
}

function addNewClick() {
  localName.value = '';
  mode.value = EditState.Adding;
}

watch(
  () => props.modelValue,
  () => {
    localName.value = props.modelValue;
  },
);

function saveNewName() {
  if (mode.value === EditState.Adding) {
    emit('new', localName.value);
  } else if (mode.value === EditState.Duplicating) {
    emit('duplicate', props.modelValue, localName.value);
  } else {
    // Editing
    emit('rename', props.modelValue, localName.value);
  }
  mode.value = EditState.None;
}
</script>

<template>
  <form class="d-flex flex-row" @submit.prevent="saveNewName">
    <div class="flex-grow-1">
      <slot v-if="mode === EditState.None"> </slot>
      <BFormInput v-else v-model="localName" size="sm"> </BFormInput>
    </div>
    <div
      class="flex-grow-2 mt-auto d-flex gap-1 ms-1"
      :class="alignVertical ? 'flex-column' : 'flex-row'"
    >
      <template v-if="allowEdit && mode === EditState.None">
        <BButton
          size="sm"
          variant="secondary"
          :title="`Edit this ${editableName}.`"
          @click="mode = EditState.Editing"
        >
          <i-mdi-pencil />
        </BButton>
        <BButton
          v-if="allowDuplicate"
          size="sm"
          variant="secondary"
          :title="`Duplicate ${editableName}.`"
          @click="duplicate"
        >
          <i-mdi-content-copy />
        </BButton>
        <BButton
          size="sm"
          variant="secondary"
          :title="`Delete this ${editableName}.`"
          @click="$emit('delete', modelValue)"
        >
          <i-mdi-delete />
        </BButton>
      </template>
      <BButton
        v-if="allowAdd && mode === EditState.None"
        size="sm"
        :title="`Add new ${editableName}.`"
        variant="primary"
        @click="addNewClick"
        ><i-mdi-plus-box-outline />
      </BButton>
      <template v-if="mode !== EditState.None">
        <BButton
          size="sm"
          :title="`Add new ${editableName}`"
          variant="primary"
          @click="saveNewName"
        >
          <i-mdi-check />
        </BButton>
        <BButton size="sm" title="Abort" variant="secondary" @click="abort">
          <i-mdi-close />
        </BButton>
      </template>
    </div>
  </form>
</template>
