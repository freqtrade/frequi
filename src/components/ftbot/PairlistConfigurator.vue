<script setup lang="ts">
import type { Pairlist } from '@/types';
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
    if (!pairlist) {
      console.error('Pairlist not found');
      return;
    }
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

if (pairlistStore.whitelist.length > 0) {
  selectedView.value = 'Results';
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] px-3 mb-3 gap-3 w-full">
    <ul
      ref="availablePairlistsEl"
      class="divide-y border-x border-surface-500 rounded-sm border-y divide-solid divide-surface-500 min-w-72"
    >
      <li
        v-for="pairlist in availablePairlists"
        :key="pairlist.name"
        :class="{
          'no-drag text-gray-500 hover:cursor-default':
            pairlistStore.config.pairlists.length == 0 && !pairlist.is_pairlist_generator,
        }"
        class="pairlist flex text-start items-center py-2 px-3 hover:cursor-grab"
      >
        <div class="flex grow items-start flex-col">
          <span class="font-bold">{{ pairlist.name }}</span>
          <span class="text-sm text-muted-color">{{ pairlist.description }}</span>
        </div>
        <Button
          severity="secondary"
          class="dark:text-white"
          variant="text"
          :disabled="pairlistStore.config.pairlists.length == 0 && !pairlist.is_pairlist_generator"
          @click="pairlistStore.addToConfig(pairlist, pairlistStore.config.pairlists.length)"
        >
          <template #icon>
            <i-mdi-arrow-right-bold-box-outline />
          </template>
        </Button>
      </li>
    </ul>
    <div class="flex flex-col">
      <PairlistConfigActions />
      <div class="border rounded-sm border-surface-500 p-2 mb-2">
        <div class="flex items-center gap-2 my-2">
          <span class="col-auto">Stake currency: </span>
          <InputText v-model="pairlistStore.stakeCurrency" size="small" />
        </div>

        <div class="mb-2 border rounded-sm border-surface-500 p-2 text-start">
          <BaseCheckbox v-model="pairlistStore.customExchange" class="mb-2">
            Custom Exchange
          </BaseCheckbox>
          <Transition name="fade">
            <ExchangeSelect
              v-if="pairlistStore.customExchange"
              v-model="pairlistStore.selectedExchange"
            />
          </Transition>
        </div>
      </div>
      <PairlistConfigBlacklist />
      <Message
        v-if="pairlistStore.config.pairlists.length > 0 && !pairlistStore.firstPairlistIsGenerator"
        class="my-2"
        severity="warn"
      >
        First entry in the pairlist must be a Generating pairlist, like StaticPairList or
        VolumePairList.
      </Message>
      <div
        ref="pairlistConfigsEl"
        class="flex flex-col grow relative border rounded-sm border-surface-500 p-1 gap-2 min-h-32"
        :class="{ empty: configEmpty }"
      >
        <PairlistConfigItem
          v-for="(pairlist, i) in pairlistStore.config.pairlists"
          :key="pairlist.id"
          v-model="pairlistStore.config.pairlists[i]!"
          :index="i"
          @remove="pairlistStore.removeFromConfig"
        />
      </div>
    </div>
    <div class="flex flex-col w-full min-w-72">
      <SelectButton
        v-model="selectedView"
        class="mb-2"
        size="small"
        :allow-empty="false"
        option-label="value"
        option-value="value"
        :options="[
          { value: 'Config' },
          { value: 'Results', disabled: pairlistStore.whitelist.length === 0 },
        ]"
        option-disabled="disabled"
      >
      </SelectButton>
      <div class="relative overflow-auto">
        <CopyableTextfield
          v-if="selectedView === 'Config'"
          class="lg:a22bsolute w-full"
          :content="pairlistStore.configJSON"
          :is-valid="pairlistStore.pairlistValid"
        />
        <CopyableTextfield
          v-if="selectedView === 'Results'"
          class="lg:abs22olute w-full"
          :content="pairlistStore.whitelist"
        />
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
@reference '../../styles/tailwind.css';

.pairlist.dragging {
  @apply border-white border bg-white dark:bg-black;
  /* border: 1px solid white; */
  /* border-radius: 0; */
}

.empty:after {
  content: 'Drag pairlist here';
  position: absolute;
  align-self: center;
  font-size: 1.1rem;
  text-transform: uppercase;
  line-height: 0;
  top: 50%;
}
</style>
