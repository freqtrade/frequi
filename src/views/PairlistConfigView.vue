<template>
  <div>
    <div>
      <b-form-select v-model="selectedConfig" :options="configsSelectOptions"></b-form-select>
      <p>{{ progressMessage }}</p>
      <b-button :disabled="evaluating" @click="test">Test</b-button>
      <div>
        <code v-if="whitelist.length > 0">{{ whitelist }}</code>
      </div>
      <PairlistConfigurator :config="selectedConfig" @save-config="addConfig" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { ref, computed } from 'vue';
import PairlistConfigurator from '@/components/ftbot/PairlistConfigurator.vue';
import { PairlistConfig, PairlistParamType, PairlistPayloadItem } from '@/types';

const botStore = useBotStore();
const configs = ref<PairlistConfig[]>([]);
const selectedConfig = ref<PairlistConfig>({ name: '', pairlists: [] });
const whitelist = ref<string[]>([]);
const evaluating = ref(false);
const progressMessage = ref('');

const addConfig = (config: PairlistConfig) => {
  const i = configs.value.findIndex((c) => c.name === config.name);

  if (i > -1) {
    configs.value[i] = config;
  } else {
    configs.value.push(config);
  }
  selectedConfig.value = config;
};

const configsSelectOptions = computed(() => {
  const options = configs.value.map((c) => {
    return { value: c, text: c.name };
  });

  const val: PairlistConfig = {
    name: '',
    pairlists: [],
  };

  return [{ text: 'New config...', value: val }, ...options];
});

const test = async () => {
  if (!selectedConfig.value) return;

  const payload = configToPayload();

  evaluating.value = true;
  whitelist.value = [];
  const res = await botStore.activeBot.evaluatePairlist(payload);
  console.log(res);
  progressMessage.value = res.status;
  const evalIntervalId = setInterval(async () => {
    const res = await botStore.activeBot.getPairlistEvalStatus();
    if (res.status === 'success' && res.result) {
      whitelist.value = res.result.whitelist;
      clearInterval(evalIntervalId);
      evaluating.value = false;
      progressMessage.value = '';
    } else if (res.error) {
      progressMessage.value = res.error;
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
  const pairlists: PairlistPayloadItem[] = [];

  selectedConfig.value.pairlists.forEach((config) => {
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

  return {
    pairlists: pairlists,
    stake_currency: botStore.activeBot.stakeCurrency,
    blacklist: [],
  };
};
</script>
