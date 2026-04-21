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
      <UInput v-else v-model="localName" class="w-full"> </UInput>
    </div>
    <div class="mt-auto flex gap-1 ms-1" :class="alignVertical ? 'flex-col' : 'flex-row'">
      <template v-if="allowEdit && mode === EditState.None">
        <UButton
          color="neutral"
          :title="`Edit this ${editableName}.`"
          icon="mdi:pencil"
          @click="mode = EditState.Editing"
        />
        <UButton
          v-if="allowDuplicate"
          color="neutral"
          :title="`Duplicate ${editableName}.`"
          icon="mdi:content-copy"
          @click="duplicate"
        />
        <UButton
          color="neutral"
          :title="`Delete this ${editableName}.`"
          icon="mdi:delete"
          @click="$emit('delete', modelValue)"
        />
      </template>
      <UButton
        v-if="allowAdd && mode === EditState.None"
        :title="`Add new ${editableName}.`"
        icon="mdi:plus-box-outline"
        variant="solid"
        @click="addNewClick"
      />
      <template v-if="mode !== EditState.None">
        <UButton :title="`Add new ${editableName}`" icon="mdi:check" @click="saveNewName" />
        <UButton title="Abort" color="neutral" icon="mdi:close" @click="abort" />
      </template>
    </div>
  </form>
</template>
