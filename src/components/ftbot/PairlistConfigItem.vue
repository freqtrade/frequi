<template>
  <b-card no-body class="mb-2">
    <template #header>
      <b-row align-v="center">
        <b-col>
          <b-row align-v="center">
            <b-col cols="auto"><i-mdi-reorder-horizontal class="handle me-2 fs-4" /></b-col>
            <b-col
              ><b-button variant="link" @click="visible = !visible">
                <h6 class="mb-0">{{ pairlist.name }}</h6>
              </b-button></b-col
            >
          </b-row>
        </b-col>
        <b-col cols="auto">
          <b-button size="sm" @click="emit('remove', index)">x</b-button>
        </b-col>
      </b-row>
    </template>
    <b-card-body :class="{ hidden: !visible }">
      <b-collapse v-model="visible">
        <PairlistConfigParameter
          v-for="(parameter, key) in pairlist.params"
          :key="key"
          v-model="pairlist.params[key].value"
          :param="parameter"
        />
      </b-collapse>
    </b-card-body>
  </b-card>
</template>

<script setup lang="ts">
import { Pairlist } from '@/types';
import { computed, ref } from 'vue';
import PairlistConfigParameter from '../general/PairlistConfigParameter.vue';

const props = defineProps<{
  modelValue: Pairlist;
  index: number;
}>();

const emit = defineEmits(['update:modelValue', 'remove']);

const visible = ref(false);

const pairlist = computed({
  get() {
    return props.modelValue;
  },
  set(value: Pairlist) {
    emit('update:modelValue', value);
  },
});
</script>

<style>
.hidden {
  padding: 0;
}

.collapsing {
  -webkit-transition: none;
  transition: none;
  display: none;
}
</style>
