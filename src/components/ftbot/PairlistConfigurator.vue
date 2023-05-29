<template>
  <b-container fluid>
    <b-row align-v="stretch">
      <b-col cols="12" md="3" class="overflow-auto" style="height: 760px">
        <b-list-group ref="availablePairlistsEl" class="available-pairlists">
          <b-list-group-item
            v-for="pairlist in availablePairlists"
            :key="pairlist.name"
            align-v="center"
            :class="{ 'no-drag': config.pairlists.length == 0 && !pairlist.is_pairlist_generator }"
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
              :disabled="config.pairlists.length == 0 && !pairlist.is_pairlist_generator"
              @click="addToConfig(pairlist, selectedConfig.pairlists.length)"
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
              v-model="config.name"
              class="mb-2"
              placeholder="Configuration name..."
            ></b-form-input>
          </b-col>
          <b-col cols="auto">
            <b-button @click="save">Save</b-button>
          </b-col>
        </b-row>
        <div ref="pairlistConfigsEl" class="h-100">
          <b-alert
            :model-value="config.pairlists.length > 0 && !firstPairlistIsGenerator"
            variant="warning"
          >
            First entry in the pairlist must be a Generating pairlist, like StaticPairList or
            VolumePairList.
          </b-alert>
          <PairlistConfigItem
            v-for="(pairlist, i) in pairlistsComp"
            :key="pairlist.id"
            v-model="config.pairlists[i]"
            :index="i"
            @remove="removeFromConfig"
          />
          <b-button
            :disabled="evaluating || !pairlistValid"
            variant="primary"
            size="lg"
            squared
            class="mt-2 evaluate"
            @click="evaluateClick"
          >
            <b-spinner v-if="evaluating" small></b-spinner>
            <span>{{ evaluating ? 'Evaluating...' : 'Evaluate' }}</span>
          </b-button>
        </div>
      </b-col>
      <b-col cols="12" md="3">
        <i-mdi-content-copy
          v-if="isSupported && pairlistValid"
          role="button"
          class="position-absolute end-0 mt-1 me-3"
          @click="copy(configJSON)"
        />
        <pre class="text-start border p-1"><code>{{ configJSON }}</code></pre>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import PairlistConfigItem from './PairlistConfigItem.vue';
import { Pairlist, PairlistConfig, PairlistParamType, PairlistPayloadItem } from '@/types';
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable';
import { useClipboard } from '@vueuse/core';

const emit = defineEmits([
  'update:modelValue',
  'saveConfig',
  'started',
  'progress',
  'done',
  'error',
]);
const props = defineProps<{
  selectedConfig: PairlistConfig;
}>();

const botStore = useBotStore();

const availablePairlists = ref<Pairlist[]>([]);
const config = ref<PairlistConfig>(props.selectedConfig);
const pairlistConfigsEl = ref<HTMLElement | null>(null);
const availablePairlistsEl = ref<HTMLElement | null>(null);
const evaluating = ref(false);

const firstPairlistIsGenerator = computed<boolean>(() => {
  // First pairlist must be a generator
  if (config.value.pairlists[0]?.is_pairlist_generator) {
    return true;
  }
  return false;
});

const pairlistValid = computed<boolean>(() => {
  return firstPairlistIsGenerator.value && config.value.pairlists.length > 0;
});

// v-for updates with sorting, deleting and adding items seem to get wonky without unique keys for every item
const pairlistsComp = computed(() =>
  config.value.pairlists.map((p) => {
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

useSortable(availablePairlistsEl, availablePairlists.value, {
  group: {
    name: 'configurator',
    pull: 'clone',
    put: false,
  },
  sort: false,
  filter: '.no-drag',
});

useSortable(pairlistConfigsEl, config.value.pairlists, {
  handle: '.handle',
  group: 'configurator',
  onUpdate: async (e) => {
    moveArrayElement(config.value.pairlists, e.oldIndex, e.newIndex);
  },
  onAdd: (e) => {
    const pairlist = availablePairlists.value[e.oldIndex];
    addToConfig(pairlist, e.newIndex);
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

function addToConfig(pairlist: Pairlist, index: number) {
  pairlist = structuredClone(toRaw(pairlist));
  for (const param in pairlist.params) {
    pairlist.params[param].value = pairlist.params[param].default
      ? pairlist.params[param].default.toString()
      : '';
  }
  config.value.pairlists.splice(index, 0, pairlist);
}

function removeFromConfig(index: number) {
  config.value.pairlists.splice(index, 1);
}

async function save() {
  emit('saveConfig', config.value);
}

const { copy, isSupported } = useClipboard();

async function evaluateClick() {
  const payload = configToPayload();

  evaluating.value = true;
  const res = await botStore.activeBot.evaluatePairlist(payload);
  emit('started', res);
  const evalIntervalId = setInterval(async () => {
    const res = await botStore.activeBot.getPairlistEvalStatus(evalIntervalId);
    if (res.status === 'success' && res.result) {
      emit('done', res);
      clearInterval(evalIntervalId);
      evaluating.value = false;
    } else if (res.error) {
      emit('error', res);
      clearInterval(evalIntervalId);
      evaluating.value = false;
    }
  }, 1000);
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
  config.value.pairlists.forEach((config) => {
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

watch(
  () => props.selectedConfig,
  () => {
    config.value = structuredClone(toRaw(props.selectedConfig));
  },
);
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
