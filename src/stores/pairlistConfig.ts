import { defineStore } from 'pinia';
import { useBotStore } from './ftbotwrapper';

import {
  ExchangeSelection,
  MarginMode,
  Pairlist,
  PairlistConfig,
  PairlistParamType,
  PairlistParamValue,
  PairlistPayloadItem,
  PairlistsPayload,
  TradingMode,
} from '@/types';

import { showAlert } from '../shared/alerts';
import { isNotUndefined } from '@/shared/formatters';

export const usePairlistConfigStore = defineStore(
  'pairlistConfig',
  () => {
    const botStore = useBotStore();

    const evaluating = ref<boolean>(false);
    const intervalId = ref<number>();
    const stakeCurrency = ref<string>(botStore.activeBot?.stakeCurrency ?? 'USDT');
    const whitelist = ref<string[]>([]);
    const customExchange = ref<boolean>(false);
    const selectedExchange = ref<ExchangeSelection>({
      exchange: botStore.activeBot?.botState.exchange ?? '',
      trade_mode: {
        trading_mode: botStore.activeBot?.botState.trading_mode ?? TradingMode.SPOT,
        margin_mode:
          botStore.activeBot?.botState.trading_mode === TradingMode.FUTURES
            ? MarginMode.ISOLATED
            : MarginMode.NONE,
      },
    });

    const config = ref<PairlistConfig>(makeConfig());
    const savedConfigs = ref<PairlistConfig[]>([]);
    const configName = ref<string>('');

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

    const configJSON = computed(() => {
      return JSON.stringify(configToPayloadItems(), null, 2);
    });

    const isSavedConfig = (name: string) =>
      savedConfigs.value.findIndex((c) => c.name === name) > -1;

    function addToConfig(pairlist: Pairlist, index: number) {
      pairlist = structuredClone(toRaw(pairlist));
      pairlist.showParameters = false;
      if (!pairlist.id) {
        pairlist.id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      }
      for (const param in pairlist.params) {
        pairlist.params[param].value = isNotUndefined(pairlist.params[param].default)
          ? pairlist.params[param].default
          : '';
      }
      config.value.pairlists.splice(index, 0, pairlist);
    }

    function removeFromConfig(index: number) {
      config.value.pairlists.splice(index, 1);
    }

    function saveConfig(name = '') {
      const i = savedConfigs.value.findIndex((c) => c.name === config.value.name);
      config.value.name = name;

      if (i > -1) {
        savedConfigs.value[i] = structuredClone(toRaw(config.value));
      } else {
        savedConfigs.value.push(structuredClone(toRaw(config.value)));
      }
    }

    function newConfig(name: string) {
      const c = makeConfig({ name });
      savedConfigs.value.push(c);
      config.value = structuredClone(c);
    }

    function duplicateConfig(name = '') {
      const c = makeConfig({
        name,
        pairlists: toRaw(config.value.pairlists) as [],
        blacklist: toRaw(config.value.blacklist) as [],
      });
      savedConfigs.value.push(c);
      config.value = structuredClone(c);
    }

    function deleteConfig() {
      const i = savedConfigs.value.findIndex((c) => c.name === config.value.name);
      if (i > -1) {
        savedConfigs.value.splice(i, 1);
        selectOrCreateConfig(
          savedConfigs.value.length > 0 ? savedConfigs.value[0].name : 'default',
        );
      }
    }

    function selectOrCreateConfig(name: string) {
      const c = savedConfigs.value.find((c) => name === c.name);
      if (c) {
        config.value = structuredClone(toRaw(c));
      } else {
        newConfig(name);
      }
    }

    function makeConfig({ name = '', pairlists = [], blacklist = [] } = {}): PairlistConfig {
      return { name, pairlists, blacklist };
    }

    function addToBlacklist() {
      config.value.blacklist.push('');
    }

    function removeFromBlacklist(index: number) {
      config.value.blacklist.splice(index, 1);
    }

    function duplicateBlacklist(configName: string) {
      const conf = savedConfigs.value.find((c) => c.name === configName);
      if (conf) {
        config.value.blacklist = structuredClone(toRaw(conf.blacklist));
      }
    }

    async function startPairlistEvaluation() {
      const payload: PairlistsPayload = configToPayload();

      evaluating.value = true;
      try {
        const { job_id: jobId } = await botStore.activeBot.evaluatePairlist(payload);
        console.log('jobId', jobId);

        intervalId.value = setInterval(async () => {
          const res = await botStore.activeBot.getBackgroundJobStatus(jobId);
          if (!res.running) {
            clearInterval(intervalId.value);
            const wl = await botStore.activeBot.getPairlistEvalResult(jobId);
            evaluating.value = false;
            if (wl.status === 'success') {
              whitelist.value = wl.result.whitelist;
            } else if (wl.error) {
              showAlert(wl.error, 'danger');
              evaluating.value = false;
            }
          }
        }, 1000);
      } catch (error) {
        showAlert('Evaluation failed', 'danger');
        evaluating.value = false;
      }
    }

    function convertToParamType(type: PairlistParamType, value: PairlistParamValue) {
      if (type === PairlistParamType.number) {
        return Number(value);
      } else if (type === PairlistParamType.boolean) {
        return Boolean(value);
      } else {
        return String(value);
      }
    }

    function configToPayload(): PairlistsPayload {
      const pairlists: PairlistPayloadItem[] = configToPayloadItems();
      const c: PairlistsPayload = {
        pairlists: pairlists,
        stake_currency: stakeCurrency.value,
        blacklist: config.value.blacklist,
      };
      if (customExchange.value) {
        console.log('setting custom exchange props');
        c.exchange = selectedExchange.value.exchange;
        c.trading_mode = selectedExchange.value.trade_mode.trading_mode;
        c.margin_mode = selectedExchange.value.trade_mode.margin_mode;
      }
      return c;
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
      () => config.value,
      () => {
        configName.value = config.value.name;
      },
      {
        deep: true,
      },
    );

    return {
      evaluating,
      whitelist,
      config,
      configJSON,
      savedConfigs,
      configName,
      startPairlistEvaluation,
      addToConfig,
      removeFromConfig,
      saveConfig,
      duplicateConfig,
      deleteConfig,
      newConfig,
      selectOrCreateConfig,
      addToBlacklist,
      removeFromBlacklist,
      duplicateBlacklist,
      isSavedConfig,
      firstPairlistIsGenerator,
      pairlistValid,
      stakeCurrency,
      customExchange,
      selectedExchange,
    };
  },
  {
    persist: {
      key: 'ftPairlistConfig',
      paths: ['savedConfigs', 'configName'],
    },
  },
);
