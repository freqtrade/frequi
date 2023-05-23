<template>
  <b-modal
    v-model="visible"
    :scrollable="true"
    :no-close-on-backdrop="true"
    ok-title="Save"
    title="Pairlist configurator"
    @ok="save"
    @show="configureConfig"
  >
    <div class="mb-2">
      <b-form-input v-model="config.name" placeholder="Configuration name..."></b-form-input>
    </div>
    <b-form-select
      v-model="selectedPairlist"
      :options="pairlistSelectOptions"
      class="mb-2"
      @input="addToConfig"
    ></b-form-select>
    <div ref="pairlistConfigsEl">
      <PairlistConfigItem
        v-for="(pairlist, i) in pairlists"
        :key="pairlist.id"
        v-model="config.pairlists[i]"
        :index="i"
        @remove="removeFromConfig"
      />
    </div>
  </b-modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import PairlistConfigItem from './PairlistConfigItem.vue';
import { Pairlist, PairlistConfig } from '@/types';
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable';

const emit = defineEmits(['update:modelValue', 'saveConfig']);
const props = defineProps<{
  modelValue: boolean;
  config: PairlistConfig;
}>();

const botStore = useBotStore();

const availablePairlists = ref<Pairlist[]>([]);
const selectedPairlist = ref<Pairlist>({} as Pairlist);
const config = ref<PairlistConfig>(props.config);
const pairlistConfigsEl = ref<HTMLElement | null>(null);

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit('update:modelValue', value);
  },
});

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

const pairlistSelectOptions = computed(() => {
  const pairlists = availablePairlists.value.map((p) => {
    return { value: p, text: p.name };
  });

  return [{ text: 'Select a pairlist....', value: {} }, ...pairlists];
});

useSortable(pairlistConfigsEl, config.value.pairlists, {
  handle: '.handle',
  onUpdate: async (e) => {
    moveArrayElement(config.value.pairlists, e.oldIndex, e.newIndex);
  },
});

onMounted(async () => {
  availablePairlists.value = (await botStore.activeBot.getPairlists()).pairlists;
});

const addToConfig = () => {
  if (selectedPairlist.value) {
    const pairlist = structuredClone(toRaw(selectedPairlist.value));
    for (const param in pairlist.params) {
      pairlist.params[param].value = pairlist.params[param].default
        ? pairlist.params[param].default.toString()
        : '';
    }
    config.value.pairlists.push(pairlist);
    selectedPairlist.value = {} as Pairlist;
  }
};

const removeFromConfig = (index: number) => {
  config.value.pairlists.splice(index, 1);
};

const save = async (e: Event) => {
  e.preventDefault();
  emit('saveConfig', config.value);
  visible.value = false;
};

const configureConfig = () => {
  config.value = structuredClone(toRaw(props.config));
};
</script>
