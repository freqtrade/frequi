<template>
  <b-container fluid>
    <b-row align-v="stretch">
      <b-col cols="2">
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
                @click="addToConfig(pairlist, config.pairlists.length)"
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
            v-for="(pairlist, i) in pairlists"
            :key="pairlist.id"
            v-model="config.pairlists[i]"
            :index="i"
            @remove="removeFromConfig"
          />
        </div>
      </b-col>
      <b-col cols="3">JSON DUMP</b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import PairlistConfigItem from './PairlistConfigItem.vue';
import { Pairlist, PairlistConfig } from '@/types';
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable';

const emit = defineEmits(['update:modelValue', 'saveConfig']);
const props = defineProps<{
  config: PairlistConfig;
}>();

const botStore = useBotStore();

const availablePairlists = ref<Pairlist[]>([]);
const config = ref<PairlistConfig>(props.config);
const pairlistConfigsEl = ref<HTMLElement | null>(null);
const availablePairlistsEl = ref<HTMLElement | null>(null);

// v-for updates with sorting, deleting and adding items seem to get wonky without unique keys for every item
const pairlists = computed(() =>
  config.value.pairlists.map((p) => {
    if (p.id) {
      return p;
    } else {
      return { id: Date.now().toString(36) + Math.random().toString(36).substring(2), ...p };
    }
  }),
);

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

watch(
  () => props.config,
  () => {
    config.value = structuredClone(toRaw(props.config));
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
