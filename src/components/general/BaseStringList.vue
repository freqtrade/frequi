<script setup lang="ts">
const values = defineModel<string[]>({ required: true });
withDefaults(
  defineProps<{
    placeholder?: string;
    size?: 'small' | 'large';
  }>(),
  {
    placeholder: '',
    size: 'small',
  },
);
</script>

<template>
  <div class="flex flex-row gap-2">
    <div class="flex gap-1 flex-col w-full">
      <div v-for="(val, idx) in values" :key="idx" class="flex flex-row gap-1">
        <InputText
          v-model="values[idx]"
          size="small"
          class="w-full"
          :placeholder="placeholder"
        ></InputText>
        <Button
          severity="secondary"
          variant="outlined"
          title="Delete this value."
          class="flex align-items-center justify-content-center"
          @click="values.splice(idx, 1)"
        >
          <template #icon>
            <i-mdi-delete />
          </template>
        </Button>
      </div>
    </div>
    <Button
      :title="`Add new value`"
      severity="secondary"
      class="mt-auto flex align-items-center justify-content-center"
      @click="values.push('')"
    >
      <template #icon>
        <i-mdi-plus-box-outline />
      </template>
    </Button>
  </div>
</template>
