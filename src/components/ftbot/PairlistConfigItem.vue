<template>
  <b-card no-body class="mb-2">
    <template #header>
      <div class="d-flex text-start align-items-center">
        <div class="d-flex flex-grow-1 align-items-center">
          <i-mdi-reorder-horizontal
            role="button"
            class="handle me-2 fs-4 flex-shrink-0"
            width="24"
            height="24"
          />
          <div
            role="button"
            class="d-flex flex-grow-1 align-items-start flex-column"
            @click="toggleVisible"
          >
            <span class="fw-bold fd-italic">{{ pairlist.name }}</span>
            <span class="fw-lighter">{{ pairlist.description }}</span>
          </div>
        </div>
        <i-mdi-close
          role="button"
          width="24"
          height="24"
          class="mx-2"
          @click="pairlistStore.removeFromConfig(index)"
        />
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
      </div>
    </template>
    <b-collapse v-model="visible">
      <b-card-body>
        <PairlistConfigParameter
          v-for="(parameter, key) in pairlist.params"
          :key="key"
          v-model="pairlist.params[key].value"
          :param="parameter"
        />
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script setup lang="ts">
import { Pairlist } from '@/types';
import { ref } from 'vue';
import PairlistConfigParameter from './PairlistConfigParameter.vue';
import { computed } from 'vue';
import { usePairlistConfigStore } from '@/stores/pairlistConfig';

const pairlistStore = usePairlistConfigStore();

defineProps<{
  index: number;
}>();

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
