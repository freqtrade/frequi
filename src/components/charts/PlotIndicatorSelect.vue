<script setup lang="ts">
defineProps<{
  columns: string[];
  label: string;
}>();

const model = defineModel<string>({
  default: '',
});

const emit = defineEmits<{
  indicatorSelected: [value: string];
}>();

function abort() {
  model.value = '';
  emit('indicatorSelected', model.value);
}
</script>

<template>
  <div class="flex flex-row">
    <UFormField :label class="grow">
      <USelectMenu
        v-model="model"
        :items="columns"
        :clearable="false"
        filter
        class="w-full"
        auto-filter-focus
        @change="emit('indicatorSelected', model)"
      >
      </USelectMenu>
    </UFormField>
    <UButton title="Abort" class="ms-1 mt-auto" color="neutral" icon="mdi:close" @click="abort" />
  </div>
</template>
