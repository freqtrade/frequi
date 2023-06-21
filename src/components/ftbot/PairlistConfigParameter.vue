<template>
  <b-form-group label-cols="4" label-size="md" class="pb-1 text-start" :description="param.help">
    <b-form-input
      v-if="param.type === PairlistParamType.string || param.type === PairlistParamType.number"
      v-model="paramValue"
      size="sm"
    ></b-form-input>

    <b-form-checkbox
      v-if="param.type === PairlistParamType.boolean"
      v-model="paramValue"
    ></b-form-checkbox>

    <b-form-select
      v-if="param.type === PairlistParamType.option"
      v-model="paramValue"
      :options="param.options"
    ></b-form-select>

    <template #label>
      <label> {{ param.description }}</label>
    </template>
  </b-form-group>
</template>

<script setup lang="ts">
import { PairlistParameter, PairlistParamType } from '@/types';

defineProps<{
  param: PairlistParameter;
}>();

//TODO: type should really be PairlistParamValue
const paramValue = defineModel<any>();
</script>
