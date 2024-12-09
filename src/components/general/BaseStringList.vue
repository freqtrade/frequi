<script setup lang="ts">
import { BaseSize } from 'bootstrap-vue-next';

const values = defineModel<string[]>({ required: true });
withDefaults(
  defineProps<{
    placeholder?: string;
    size?: keyof BaseSize;
  }>(),
  {
    placeholder: '',
    size: 'sm',
  },
);
</script>

<template>
  <div class="d-flex flex-row gap-2">
    <div class="d-flex gap-1 flex-column w-100">
      <div v-for="(val, idx) in values" :key="idx" class="d-flex flex-row gap-1">
        <BFormInput v-model="values[idx]" size="sm" :placeholder="placeholder"></BFormInput>
        <BButton
          :size="size"
          variant="outline-secondary"
          title="Delete this value."
          class="d-flex align-items-center justify-content-center"
          @click="values.splice(idx, 1)"
        >
          <i-mdi-delete />
        </BButton>
      </div>
    </div>
    <BButton
      :size="size"
      :title="`Add new value`"
      variant="secondary"
      class="mt-auto d-flex align-items-center justify-content-center"
      @click="values.push('')"
    >
      <i-mdi-plus-box-outline />
    </BButton>
  </div>
</template>
