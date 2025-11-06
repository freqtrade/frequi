<script setup lang="ts">
import type { PairlistParameter } from '@/types';
import { PairlistParamType } from '@/types';

defineProps<{
  param: PairlistParameter;
}>();

// TODO: type should really be PairlistParamValue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paramValue = defineModel<any>();
</script>

<template>
  <div class="pb-1 flex flex-row text-start">
    <label class="w-2/5"> {{ param.description }}</label>
    <div class="flex flex-col w-full">
      <InputText
        v-if="param.type === PairlistParamType.string || param.type === PairlistParamType.number"
        v-model="paramValue"
        size="small"
      ></InputText>

      <BaseCheckbox
        v-if="param.type === PairlistParamType.boolean"
        v-model="paramValue"
      ></BaseCheckbox>

      <Select
        v-if="param.type === PairlistParamType.option"
        v-model="paramValue"
        :options="param.options"
      ></Select>
      <BaseStringList
        v-if="param.type === PairlistParamType.list"
        v-model="paramValue"
      ></BaseStringList>
      <span class="text-muted text-sm text-surface-500">{{ param.help }}</span>
    </div>
  </div>
</template>
