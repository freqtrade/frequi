<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    allowEdit?: boolean;
    allowAdd?: boolean;
    allowDuplicate?: boolean;
    editableName: string;
    alignVertical?: boolean;
  }>(),
  {
    allowEdit: false,
    allowAdd: false,
    allowDuplicate: false,
    alignVertical: false,
  },
);

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
  <form class="flex flex-row" @submit.prevent="saveNewName">
    <div class="grow">
      <slot v-if="mode === EditState.None"> </slot>
      <InputText v-else v-model="localName" size="small" fluid> </InputText>
    </div>
    <div class="mt-auto flex gap-1 ms-1" :class="alignVertical ? 'flex-col' : 'flex-row'">
      <template v-if="allowEdit && mode === EditState.None">
        <Button
          size="small"
          severity="secondary"
          :title="`Edit this ${editableName}.`"
          @click="mode = EditState.Editing"
        >
          <template #icon>
            <i-mdi-pencil />
          </template>
        </Button>
        <Button
          v-if="allowDuplicate"
          size="small"
          severity="secondary"
          :title="`Duplicate ${editableName}.`"
          @click="duplicate"
        >
          <template #icon>
            <i-mdi-content-copy />
          </template>
        </Button>
        <Button
          size="small"
          severity="secondary"
          :title="`Delete this ${editableName}.`"
          @click="$emit('delete', modelValue)"
        >
          <template #icon>
            <i-mdi-delete />
          </template>
        </Button>
      </template>
      <Button
        v-if="allowAdd && mode === EditState.None"
        size="small"
        :title="`Add new ${editableName}.`"
        severity="primary"
        @click="addNewClick"
      >
        <template #icon>
          <i-mdi-plus-box-outline />
        </template>
      </Button>
      <template v-if="mode !== EditState.None">
        <Button
          size="small"
          :title="`Add new ${editableName}`"
          severity="primary"
          @click="saveNewName"
        >
          <template #icon>
            <i-mdi-check />
          </template>
        </Button>
        <Button size="small" title="Abort" severity="secondary" @click="abort">
          <template #icon>
            <i-mdi-close />
          </template>
        </Button>
      </template>
    </div>
  </form>
</template>
