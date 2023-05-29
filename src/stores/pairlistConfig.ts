import { defineStore } from 'pinia';
import { useBotStore } from './ftbotwrapper';

import { Pairlist, PairlistConfig, PairlistsPayload } from '@/types';
import { computed, ref, toRaw } from 'vue';
import { showAlert } from './alerts';

export const usePairlistConfigStore = defineStore(
  'pairlistConfig',
  () => {
    const botStore = useBotStore();

    const evaluating = ref<boolean>(false);
    const intervalId = ref<number>();
    const whitelist = ref<string[]>([]);
    const config = ref<PairlistConfig>({ name: '', pairlists: [] });
    const savedConfigs = ref<PairlistConfig[]>([]);

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

    async function startPairlistEvaluation(payload: PairlistsPayload) {
      evaluating.value = true;
      await botStore.activeBot.evaluatePairlist(payload);

      intervalId.value = setInterval(async () => {
        const res = await botStore.activeBot.getPairlistEvalStatus();
        if (res.status === 'success' && res.result) {
          clearInterval(intervalId.value);
          evaluating.value = false;
          whitelist.value = res.result.whitelist;
        } else if (res.error) {
          showAlert(res.error, 'danger');
          clearInterval(intervalId.value);
          evaluating.value = false;
        }
      }, 1000);
    }

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

    const saveConfig = () => {
      const i = savedConfigs.value.findIndex((c) => c.name === config.value.name);

      if (i > -1) {
        savedConfigs.value[i] = structuredClone(toRaw(config.value));
      } else {
        savedConfigs.value.push(structuredClone(toRaw(config.value)));
      }
    };

    return {
      evaluating,
      whitelist,
      config,
      savedConfigs,
      startPairlistEvaluation,
      addToConfig,
      removeFromConfig,
      saveConfig,
      firstPairlistIsGenerator,
      pairlistValid,
    };
  },
  {
    persist: {
      key: 'pairlist-configs',
      paths: ['savedConfigs'],
    },
  },
);
