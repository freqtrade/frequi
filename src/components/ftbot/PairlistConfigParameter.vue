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
      <UFormField :help="param.help">
        <UInput
          v-if="param.type === PairlistParamType.string || param.type === PairlistParamType.number"
          v-model="paramValue"
          class="w-full"
        ></UInput>

        <BaseCheckbox
          v-if="param.type === PairlistParamType.boolean"
          v-model="paramValue"
          class="w-full"
        ></BaseCheckbox>

        <USelect
          v-if="param.type === PairlistParamType.option"
          v-model="paramValue"
          :items="param.options"
          class="w-full"
        ></USelect>
        <BaseStringList
          v-if="param.type === PairlistParamType.list"
          v-model="paramValue"
          class="w-full"
        ></BaseStringList>
      </UFormField>
    </div>
  </div>
</template>
