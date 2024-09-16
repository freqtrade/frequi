<script setup lang="ts">
import { Pairlist } from '@/types';
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable';

const botStore = useBotStore();
const pairlistStore = usePairlistConfigStore();

const availablePairlists = ref<Pairlist[]>([]);
const pairlistConfigsEl = ref<HTMLElement | null>(null);
const availablePairlistsEl = ref<HTMLElement | null>(null);
const selectedView = ref<'Config' | 'Results'>('Config');

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
  pairlistStore.selectOrCreateConfig(
    pairlistStore.isSavedConfig(pairlistStore.configName) ? pairlistStore.configName : 'default',
  );
});

watch(
  () => pairlistStore.whitelist,
  () => {
    selectedView.value = 'Results';
  },
);
</script>

<template>
  <div class="d-flex px-3 mb-3 gap-3 flex-column flex-lg-row">
    <BListGroup ref="availablePairlistsEl" class="available-pairlists">
      <BListGroupItem
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
        <BButton
          class="p-0 add-pairlist"
          style="border: none"
          variant="outline-light"
          :disabled="pairlistStore.config.pairlists.length == 0 && !pairlist.is_pairlist_generator"
          @click="pairlistStore.addToConfig(pairlist, pairlistStore.config.pairlists.length)"
        >
          <i-mdi-arrow-right-bold-box-outline class="fs-4" />
        </BButton>
      </BListGroupItem>
    </BListGroup>
    <div class="d-flex flex-column flex-fill">
      <PairlistConfigActions />
      <div class="border rounded-1 p-2 mb-2">
        <div class="d-flex align-items-center gap-2 my-2">
          <span class="col-auto">Stake currency: </span>
          <BFormInput v-model="pairlistStore.stakeCurrency" size="sm" />
        </div>

        <div class="mb-2 border rounded-1 p-2 text-start">
          <BFormCheckbox v-model="pairlistStore.customExchange" class="mb-2">
            Custom Exchange
          </BFormCheckbox>
          <ExchangeSelect
            v-if="pairlistStore.customExchange"
            v-model="pairlistStore.selectedExchange"
          />
        </div>
      </div>
      <PairlistConfigBlacklist />
      <BAlert
        :model-value="
          pairlistStore.config.pairlists.length > 0 && !pairlistStore.firstPairlistIsGenerator
        "
        variant="warning"
      >
        First entry in the pairlist must be a Generating pairlist, like StaticPairList or
        VolumePairList.
      </BAlert>
      <div
        ref="pairlistConfigsEl"
        class="d-flex flex-column flex-grow-1 position-relative border rounded-1 p-1"
        :class="{ empty: configEmpty }"
      >
        <PairlistConfigItem
          v-for="(pairlist, i) in pairlistStore.config.pairlists"
          :key="pairlist.id"
          v-model="pairlistStore.config.pairlists[i]"
          :index="i"
          @remove="pairlistStore.removeFromConfig"
        />
      </div>
    </div>
    <div class="d-flex flex-column col-12 col-lg-3">
      <BFormRadioGroup v-model="selectedView" class="mb-2" size="sm" buttons>
        <BFormRadio button value="Config"> Config</BFormRadio>
        <BFormRadio button value="Results" :disabled="pairlistStore.whitelist.length === 0">
          Results</BFormRadio
        >
      </BFormRadioGroup>
      <div class="position-relative flex-fill overflow-auto">
        <CopyableTextfield
          v-if="selectedView === 'Config'"
          class="position-lg-absolute w-100"
          :content="pairlistStore.configJSON"
          :is-valid="pairlistStore.pairlistValid"
        />
        <CopyableTextfield
          v-if="selectedView === 'Results'"
          class="position-lg-absolute w-100"
          :content="pairlistStore.whitelist"
        />
      </div>
    </div>
  </div>
</template>

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

[data-bs-theme='light'] .add-pairlist {
  color: black;
}

.empty {
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
