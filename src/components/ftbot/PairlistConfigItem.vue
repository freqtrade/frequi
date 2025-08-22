<script setup lang="ts">
import type { Pairlist } from '@/types';

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

<template>
  <div class="shadow-sm rounded-sm border border-surface-300 dark:border-surface-700">
    <div
      class="flex w-full text-start items-center bg-surface-200 dark:bg-surface-700 p-2 border-b border-surface-300 dark:border-surface-600"
    >
      <div class="flex grow items-center">
        <i-mdi-reorder-horizontal
          role="button"
          class="handle me-2 ms-2 flex-auto shrink"
          width="24"
          height="24"
        />
        <div
          role="button"
          class="flex items-start flex-col user-select-none w-full"
          @click="toggleVisible"
        >
          <span class="font-bold">{{ pairlist.name }}</span>
          <span class="text-sm">{{ pairlist.description }}</span>
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
    <Transition>
      <div v-if="pairlist.showParameters" class="p-2">
        <PairlistConfigParameter
          v-for="(parameter, key) in pairlist.params"
          :key="key"
          v-model="parameter.value"
          :param="parameter"
        />
      </div>
    </Transition>
  </div>
</template>
