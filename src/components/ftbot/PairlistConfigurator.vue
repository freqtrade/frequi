<template>
  <b-container fluid>
    <b-row align-v="stretch">
      <b-col cols="12" md="3" class="overflow-auto">
        <b-list-group ref="availablePairlistsEl" class="available-pairlists">
          <b-list-group-item
            v-for="pairlist in availablePairlists"
            :key="pairlist.name"
            align-v="center"
            :class="{
              'no-drag':
                pairlistStore.config.pairlists.length == 0 && !pairlist.is_pairlist_generator,
            }"
            class="pairlist d-flex text-start align-items-center py-2 px-3"
          >
            <div class="d-flex flex-grow-1 align-items-start flex-column">
              <span class="fw-bold fd-italic">{{ pairlist.name }}</span>
              <span class="fw-lighter">{{ pairlist.description }}</span>
            </div>
            <b-button
              class="p-0"
              style="border: none"
              variant="outline-light"
              :disabled="
                pairlistStore.config.pairlists.length == 0 && !pairlist.is_pairlist_generator
              "
              @click="pairlistStore.addToConfig(pairlist, pairlistStore.config.pairlists.length)"
            >
              <i-mdi-arrow-right-bold-box-outline class="fs-4" />
            </b-button>
          </b-list-group-item>
        </b-list-group>
      </b-col>
      <b-col>
        <b-row>
          <b-col>
            <b-form-input
              v-model="pairlistStore.config.name"
              class="mb-2"
              placeholder="Configuration name..."
            ></b-form-input>
          </b-col>
          <b-col cols="auto">
            <b-button @click="pairlistStore.saveConfig()">Save</b-button>
          </b-col>
        </b-row>
        <b-button
          :disabled="pairlistStore.evaluating || !pairlistStore.pairlistValid"
          variant="primary"
          size="lg"
          squared
          class="mb-2 evaluate"
          @click="evaluateClick"
        >
          <b-spinner v-if="pairlistStore.evaluating" small></b-spinner>
          <span>{{ pairlistStore.evaluating ? 'Evaluating...' : 'Evaluate' }}</span>
        </b-button>
        <b-alert
          :model-value="
            pairlistStore.config.pairlists.length > 0 && !pairlistStore.firstPairlistIsGenerator
          "
          variant="warning"
        >
          First entry in the pairlist must be a Generating pairlist, like StaticPairList or
          VolumePairList.
        </b-alert>
        <div ref="pairlistConfigsEl" class="h-100">
          <PairlistConfigItem
            v-for="(pairlist, i) in pairlistsComp"
            :key="pairlist.id"
            v-model="pairlistStore.config.pairlists[i]"
            :index="i"
            @remove="pairlistStore.removeFromConfig"
          />
        </div>
      </b-col>
      <b-col cols="12" md="3">
        <CopyableTextfield :content="configJSON" :is-valid="pairlistStore.pairlistValid" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { usePairlistConfigStore } from '@/stores/pairlistConfig';
import PairlistConfigItem from './PairlistConfigItem.vue';
import { Pairlist, PairlistParamType, PairlistPayloadItem } from '@/types';
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable';
import CopyableTextfield from '@/components/general/CopyableTextfield.vue';

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

const configJSON = computed(() => {
  return JSON.stringify(configToPayloadItems(), null, 2);
});

const configsSelectOptions = computed(() =>
  pairlistStore.savedConfigs.map((c) => {
    return {
      text: c.name,
      value: c,
    };
  }),
);

useSortable(availablePairlistsEl, availablePairlists.value, {
  group: {
    name: 'configurator',
    pull: 'clone',
    put: false,
  },
  sort: false,
  filter: '.no-drag',
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

async function evaluateClick() {
  const payload = configToPayload();
  pairlistStore.startPairlistEvaluation(payload);
}

function convertToParamType(type: PairlistParamType, value: string) {
  if (type === PairlistParamType.number) {
    return Number(value);
  } else if (type === PairlistParamType.boolean) {
    return Boolean(value);
  } else {
    return String(value);
  }
}

function configToPayload() {
  const pairlists: PairlistPayloadItem[] = configToPayloadItems();
  return {
    pairlists: pairlists,
    stake_currency: botStore.activeBot.stakeCurrency,
    blacklist: [],
  };
}

function configToPayloadItems() {
  const pairlists: PairlistPayloadItem[] = [];
  pairlistStore.config.pairlists.forEach((config) => {
    const pairlist = {
      method: config.name,
    };
    for (const key in config.params) {
      const param = config.params[key];
      if (param.value) {
        pairlist[key] = convertToParamType(param.type, param.value);
      }
    }
    pairlists.push(pairlist);
  });

  return pairlists;
}
</script>

<style lang="scss" scoped>
.pairlist {
  border: 1px solid white;
}

.pairlist.no-drag {
  color: gray;
}

.pairlist.no-drag:hover {
  cursor: default;
}

.pairlist:hover {
  cursor: grab;
}

[data-theme='light'] .pairlist {
  border-color: black;
}
</style>
