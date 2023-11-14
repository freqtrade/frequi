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
            class="d-flex flex-grow-1 align-items-start flex-column user-select-none"
            @click="toggleVisible"
          >
            <span class="fw-bold">{{ pairlist.name }}</span>
            <span class="text-small">{{ pairlist.description }}</span>
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
          v-if="!pairlist.showParameters"
          :class="hasParameters && !pairlist.showParameters ? 'visible' : 'invisible'"
          role="button"
          class="fs-4"
          @click="toggleVisible"
        />
        <i-mdi-chevron-up
          v-if="pairlist.showParameters"
          :class="hasParameters && pairlist.showParameters ? 'visible' : 'invisible'"
          role="button"
          class="fs-4"
          @click="toggleVisible"
        />
      </div>
    </template>
    <b-collapse v-model="pairlist.showParameters">
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
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
import { Pairlist } from '@/types';

const pairlistStore = usePairlistConfigStore();

defineProps<{
  index: number;
}>();

const pairlist = defineModel<Pairlist>({ required: true });

const hasParameters = computed(() => Object.keys(pairlist.value.params).length > 0);

function toggleVisible() {
  if (hasParameters.value) {
    pairlist.value.showParameters = !pairlist.value.showParameters;
  }
}
</script>

<style lang="scss" scoped></style>
