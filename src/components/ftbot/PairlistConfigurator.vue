<template>
  <b-container fluid>
    <b-row align-v="stretch">
      <b-col cols="12" md="3" style="height: 760px; overflow-y: scroll">
        <div ref="availablePairlistsEl" class="available-pairlists">
          <b-row
            v-for="pairlist in availablePairlists"
            :key="pairlist.name"
            align-v="center"
            class="pairlist"
          >
            <b-col>
              {{ pairlist.name }}
            </b-col>
            <b-col cols="auto">
              <b-button
                class="p-0"
                style="border: none"
                variant="outline-light"
                @click="addToConfig(pairlist, selectedConfig.pairlists.length)"
                ><i-mdi-arrow-right-bold-box class="fs-4"
              /></b-button>
            </b-col>
          </b-row>
        </div>
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
        <div ref="pairlistConfigsEl" style="height: 100%">
          <PairlistConfigItem
            v-for="(pairlist, i) in pairlistsComp"
            :key="pairlist.id"
            v-model="config.pairlists[i]"
            :index="i"
            @remove="removeFromConfig"
          />
          <b-button
            :disabled="evaluating || config.pairlists.length == 0"
            variant="primary"
            size="lg"
            squared
            class="mt-2 evaluate"
            @click="test"
          >
            <b-spinner v-if="evaluating" small></b-spinner>
            <span>{{ evaluating ? 'Evaluating...' : 'Evaluate' }}</span>
          </b-button>
        </div>
      </b-col>
      <b-col cols="12" md="3">
        <pre class="text-start"><code>{{ configJSON }}</code></pre>
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
  availablePairlists.value = (await botStore.activeBot.getPairlists()).pairlists;
});

const addToConfig = (pairlist: Pairlist, index: number) => {
  pairlist = structuredClone(toRaw(pairlist));
  for (const param in pairlist.params) {
    pairlist.params[param].value = pairlist.params[param].default
      ? pairlist.params[param].default.toString()
      : '';
  }
  config.value.pairlists.splice(index, 0, pairlist);
};

const removeFromConfig = (index: number) => {
  config.value.pairlists.splice(index, 1);
};

const save = async () => {
  emit('saveConfig', config.value);
};

const test = async () => {
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
};

const convertToParamType = (type: PairlistParamType, value: string) => {
  if (type === PairlistParamType.number) {
    return Number(value);
  } else if (type === PairlistParamType.boolean) {
    return Boolean(value);
  } else {
    return String(value);
  }
};

const configToPayload = () => {
  const pairlists: PairlistPayloadItem[] = configToPayloadItems();
  return {
    pairlists: pairlists,
    stake_currency: botStore.activeBot.stakeCurrency,
    blacklist: [],
  };
};

const configToPayloadItems = () => {
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
};

watch(
  () => props.selectedConfig,
  () => {
    config.value = structuredClone(toRaw(props.selectedConfig));
  },
);
</script>

<style lang="scss">
.pairlist {
  padding: 1rem 0;
  width: 100%;
  border: 1px solid white;
  text-align: left;
  margin: 5px 0;
}

.pairlist:hover {
  cursor: grab;
}

[data-theme='light'] .pairlist {
  border-color: black;
}
</style>
