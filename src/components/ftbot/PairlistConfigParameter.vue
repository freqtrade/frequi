<script setup lang="ts">
import { PairlistParameter, PairlistParamType } from '@/types';

defineProps<{
  param: PairlistParameter;
}>();

// TODO: type should really be PairlistParamValue
const paramValue = defineModel<any>();
</script>

<template>
  <BFormGroup label-cols="4" label-size="md" class="pb-1 text-start" :description="param.help">
    <BFormInput
      v-if="param.type === PairlistParamType.string || param.type === PairlistParamType.number"
      v-model="paramValue"
      size="sm"
    ></BFormInput>

    <BFormCheckbox
      v-if="param.type === PairlistParamType.boolean"
      v-model="paramValue"
    ></BFormCheckbox>

    <BFormSelect
      v-if="param.type === PairlistParamType.option"
      v-model="paramValue"
      :options="param.options"
    ></BFormSelect>
    <BaseStringList
      v-if="param.type === PairlistParamType.list"
      v-model="paramValue"
    ></BaseStringList>

    <template #label>
      <label> {{ param.description }}</label>
    </template>
  </BFormGroup>
</template>
