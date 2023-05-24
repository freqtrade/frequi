<template>
  <div>
    <div>
      <b-form-select v-model="selectedConfig" :options="configsSelectOptions"></b-form-select>
      <div>
        <code v-if="whitelist.length > 0">{{ whitelist }}</code>
      </div>
      <PairlistConfigurator
        :config="selectedConfig"
        @save-config="addConfig"
        @started="evalStarted"
        @error="evalError"
        @done="evalDone"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { ref, computed } from 'vue';
import PairlistConfigurator from '@/components/ftbot/PairlistConfigurator.vue';
import { PairlistConfig, PairlistEvalResponse, StatusResponse } from '@/types';
import { showAlert } from '@/stores/alerts';

const botStore = useBotStore();
const configs = ref<PairlistConfig[]>([]);
const selectedConfig = ref<PairlistConfig>({ name: '', pairlists: [] });
const whitelist = ref<string[]>([]);

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

const evalDone = (res: PairlistEvalResponse) => {
  if (res.result?.whitelist) {
    whitelist.value = res.result.whitelist;
  }
};
const evalError = (res: PairlistEvalResponse) => {
  if (res.error) {
    showAlert(res.error, 'danger');
  }
};
const evalStarted = (res: StatusResponse) => {
  whitelist.value = [];
  showAlert(res.status, 'info');
};
</script>
