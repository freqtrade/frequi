<template>
  <b-card no-body class="mb-2">
    <template #header>
      <div class="d-flex text-start align-items-center">
        <div class="d-flex flex-grow-1 align-items-center">
          <i-mdi-reorder-horizontal role="button" class="handle me-2 fs-4" />
          <div
            role="button"
            class="d-flex flex-grow-1 align-items-start flex-column"
            @click="toggleVisible"
          >
            <span class="fw-bold fd-italic">{{ pairlist.name }}</span>
            <span class="fw-lighter">{{ pairlist.description }}</span>
          </div>
        </div>
        <i-mdi-chevron-down
          v-if="!visible"
          :class="hasParameters && !visible ? 'visible' : 'invisible'"
          role="button"
          class="fs-4"
          @click="toggleVisible"
        />
        <i-mdi-chevron-up
          v-if="visible"
          :class="hasParameters && visible ? 'visible' : 'invisible'"
          role="button"
          class="fs-4"
          @click="toggleVisible"
        />
        <b-button size="sm" class="ms-1" @click="emit('remove', index)">
          <i-mdi-close />
        </b-button>
      </div>
    </template>
    <b-card-body class="p-0">
      <b-collapse v-model="visible">
        <div class="p-3">
          <PairlistConfigParameter
            v-for="(parameter, key) in pairlist.params"
            :key="key"
            v-model="pairlist.params[key].value"
            :param="parameter"
          />
        </div>
      </b-collapse>
    </b-card-body>
  </b-card>
</template>

<script setup lang="ts">
import { Pairlist } from '@/types';
import { ref } from 'vue';
import PairlistConfigParameter from './PairlistConfigParameter.vue';
import { computed } from 'vue';

defineProps<{
  index: number;
}>();

const emit = defineEmits(['remove']);

const visible = ref(false);

const pairlist = defineModel<Pairlist>({ required: true });

const hasParameters = computed(() => Object.keys(pairlist.value.params).length > 0);

function toggleVisible() {
  if (hasParameters.value) {
    visible.value = !visible.value;
  }
}
</script>

<style lang="scss" scoped></style>
