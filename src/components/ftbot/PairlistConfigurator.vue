<template>
  <div class="d-flex px-3 gap-3 flex-column flex-lg-row">
    <b-list-group ref="availablePairlistsEl" class="available-pairlists">
      <b-list-group-item
        v-for="pairlist in availablePairlists"
        :key="pairlist.name"
        :class="{
          'no-drag': pairlistStore.config.pairlists.length == 0 && !pairlist.is_pairlist_generator,
        }"
        class="pairlist d-flex text-start align-items-center py-2 px-3"
      >
        <div class="d-flex flex-grow-1 align-items-start flex-column">
          <span class="fw-bold">{{ pairlist.name }}</span>
          <span class="text-small">{{ pairlist.description }}</span>
        </div>
        <b-button
          class="p-0 add-pairlist"
          style="border: none"
          variant="outline-light"
          :disabled="pairlistStore.config.pairlists.length == 0 && !pairlist.is_pairlist_generator"
          @click="pairlistStore.addToConfig(pairlist, pairlistStore.config.pairlists.length)"
        >
          <i-mdi-arrow-right-bold-box-outline class="fs-4" />
        </b-button>
      </b-list-group-item>
    </b-list-group>
    <div class="d-flex flex-column flex-fill">
      <PairlistConfigActions />
      <b-form-checkbox v-model="pairlistStore.customExchange" class="mb-2"
        >Custom Exchange</b-form-checkbox
      >
      <exchange-select
        v-if="pairlistStore.customExchange"
        v-model="pairlistStore.selectedExchange"
        class="mb-2"
      />
      <PairlistConfigBlacklist />
      <b-alert
        :model-value="
          pairlistStore.config.pairlists.length > 0 && !pairlistStore.firstPairlistIsGenerator
        "
        variant="warning"
      >
        First entry in the pairlist must be a Generating pairlist, like StaticPairList or
        VolumePairList.
      </b-alert>
      <div
        ref="pairlistConfigsEl"
        class="d-flex flex-column flex-grow-1 position-relative"
        :class="{ empty: configEmpty }"
      >
        <PairlistConfigItem
          v-for="(pairlist, i) in pairlistsComp"
          :key="pairlist.id"
          v-model="pairlistStore.config.pairlists[i]"
          :index="i"
          @remove="pairlistStore.removeFromConfig"
        />
      </div>
    </div>
    <div class="col-12 col-lg-3">
      <CopyableTextfield
        :content="pairlistStore.configJSON"
        :is-valid="pairlistStore.pairlistValid"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
import PairlistConfigItem from './PairlistConfigItem.vue';
import PairlistConfigBlacklist from './PairlistConfigBlacklist.vue';
import PairlistConfigActions from './PairlistConfigActions.vue';
import { Pairlist } from '@/types';
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable';
import CopyableTextfield from '@/components/general/CopyableTextfield.vue';
import ExchangeSelect from './ExchangeSelect.vue';

const botStore = useBotStore();
const pairlistStore = usePairlistConfigStore();

const availablePairlists = ref<Pairlist[]>([]);
const pairlistConfigsEl = ref<HTMLElement | null>(null);
const availablePairlistsEl = ref<HTMLElement | null>(null);

// v-for updates with sorting, deleting and adding items seem to get wonky without unique keys for every item
const pairlistsComp = computed(() =>
  pairlistStore.config.pairlists.map((p) => {
    if (p.id) {
      return p;
    } else {
      return { id: Date.now().toString(36) + Math.random().toString(36).substring(2), ...p };
    }
  }),
);

const configEmpty = computed(() => {
  return pairlistStore.config.pairlists.length == 0;
});

useSortable(availablePairlistsEl, availablePairlists.value, {
  group: {
    name: 'configurator',
    pull: 'clone',
    put: false,
  },
  sort: false,
  filter: '.no-drag',
  dragClass: 'dragging',
});

useSortable(pairlistConfigsEl, pairlistStore.config.pairlists, {
  handle: '.handle',
  group: 'configurator',
  onUpdate: async (e) => {
    moveArrayElement(pairlistStore.config.pairlists, e.oldIndex, e.newIndex);
  },
  onAdd: (e) => {
    const pairlist = availablePairlists.value[e.oldIndex];
    pairlistStore.addToConfig(pairlist, e.newIndex);
    // quick fix from: https://github.com/SortableJS/Sortable/issues/1515
    e.clone.replaceWith(e.item);
    e.clone.remove();
  },
});

onMounted(async () => {
  availablePairlists.value = (await botStore.activeBot.getPairlists()).pairlists.sort((a, b) =>
    // Sort by is_pairlist_generator (by name), then by name.
    // TODO: this might need to be improved
    a.is_pairlist_generator === b.is_pairlist_generator
      ? a.name.localeCompare(b.name)
      : a.is_pairlist_generator
      ? -1
      : 1,
  );
});
</script>

<style lang="scss" scoped>
.pairlist {
  &:hover {
    cursor: grab;
  }
  &.no-drag {
    color: gray;
  }
  &.no-drag:hover {
    cursor: default;
  }
  &.dragging {
    border: 1px solid white;
    border-radius: 0;
  }
}

[data-theme='light'] .add-pairlist {
  color: black;
}

.empty {
  border: 3px dashed rgba(255, 255, 255, 0.65);

  [data-theme='light'] & {
    border: 3px dashed rgba(0, 0, 0, 0.5);
  }

  &:after {
    content: 'Drag pairlist here';
    position: absolute;
    align-self: center;
    font-size: 1.1rem;
    text-transform: uppercase;
    line-height: 0;
    top: 50%;
  }
}
</style>
