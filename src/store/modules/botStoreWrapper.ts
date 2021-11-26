import {
  BotDescriptor,
  BotDescriptors,
  DailyPayload,
  DailyRecord,
  DailyReturnValue,
  MultiDeletePayload,
  MultiForcesellPayload,
  Trade,
} from '@/types';
import { AxiosInstance } from 'axios';
import { BotStoreActions, BotStoreGetters, createBotSubStore } from './ftbot';

const AUTH_SELECTED_BOT = 'ftSelectedBot';

interface FTMultiBotState {
  selectedBot: string;
  availableBots: BotDescriptors;
  globalAutoRefresh: boolean;
  refreshing: boolean;
  refreshInterval: number | null;
  refreshIntervalSlow: number | null;
}

export enum MultiBotStoreGetters {
  hasBots = 'hasBots',
  botCount = 'botCount',
  nextBotId = 'nextBotId',
  selectedBot = 'selectedBot',
  selectedBotObj = 'selectedBotObj',
  globalAutoRefresh = 'globalAutoRefresh',
  allAvailableBots = 'allAvailableBots',
  allAvailableBotsList = 'allAvailableBotsList',
  allTradesAllBots = 'allTradesAllBots',
  allOpenTradesAllBots = 'allOpenTradesAllBots',
  allDailyStatsAllBots = 'allDailyStatsAllBots',
  // Automatically created entries
  allIsBotOnline = 'allIsBotOnline',
  allAutoRefresh = 'allAutoRefresh',
  allProfit = 'allProfit',
  allOpenTrades = 'allOpenTrades',
  allOpenTradeCount = 'allOpenTradeCount',
  allClosedTrades = 'allClosedTrades',
  allBotState = 'allBotState',
  allBalance = 'allBalance',
}

const createAllGetters = [
  'isBotOnline',
  'autoRefresh',
  'closedTrades',
  'profit',
  'openTrades',
  'openTradeCount',
  'closedTrades',
  'botState',
  'balance',
];

export default function createBotStore(store) {
  const state: FTMultiBotState = {
    selectedBot: '',
    availableBots: {},
    globalAutoRefresh: true,
    refreshing: false,
    refreshInterval: null,
    refreshIntervalSlow: null,
  };

  // All getters working on all bots should be prefixed with all.
  const getters = {
    [MultiBotStoreGetters.hasBots](state: FTMultiBotState): boolean {
      return Object.keys(state.availableBots).length > 0;
    },
    [MultiBotStoreGetters.botCount](state: FTMultiBotState): number {
      return Object.keys(state.availableBots).length;
    },
    [MultiBotStoreGetters.nextBotId](state: FTMultiBotState): string {
      let botCount = Object.keys(state.availableBots).length;

      while (`ftbot.${botCount}` in state.availableBots) {
        botCount += 1;
      }
      return `ftbot.${botCount}`;
    },
    [MultiBotStoreGetters.selectedBot](state: FTMultiBotState): string {
      return state.selectedBot;
    },
    [MultiBotStoreGetters.selectedBotObj](state: FTMultiBotState): BotDescriptor {
      return state.availableBots[state.selectedBot];
    },
    [MultiBotStoreGetters.globalAutoRefresh](state: FTMultiBotState): boolean {
      return state.globalAutoRefresh;
    },
    [MultiBotStoreGetters.allAvailableBots](state: FTMultiBotState): BotDescriptors {
      return state.availableBots;
    },
    [MultiBotStoreGetters.allAvailableBotsList](state: FTMultiBotState): string[] {
      return Object.keys(state.availableBots);
    },
    [MultiBotStoreGetters.allTradesAllBots](state: FTMultiBotState, getters): Trade[] {
      let resp: Trade[] = [];
      getters.allAvailableBotsList.forEach((botId) => {
        const trades = getters[`${botId}/${BotStoreGetters.trades}`].map((t) => ({ ...t, botId }));

        resp = resp.concat(trades);
      });
      return resp;
    },
    [MultiBotStoreGetters.allOpenTradesAllBots](state: FTMultiBotState, getters): Trade[] {
      let resp: Trade[] = [];
      getters.allAvailableBotsList.forEach((botId) => {
        const trades = getters[`${botId}/${BotStoreGetters.openTrades}`].map((t) => ({
          ...t,
        }));

        resp = resp.concat(trades);
      });
      return resp;
    },
    [MultiBotStoreGetters.allDailyStatsAllBots](state: FTMultiBotState, getters): DailyReturnValue {
      const resp: Record<string, DailyRecord> = {};
      getters.allAvailableBotsList.forEach((botId) => {
        const x = getters[`${botId}/${BotStoreGetters.dailyStats}`]?.data?.forEach((d) => {
          if (!resp[d.date]) {
            resp[d.date] = { ...d };
          } else {
            // eslint-disable-next-line @typescript-eslint/camelcase
            resp[d.date].abs_profit += d.abs_profit;
            // eslint-disable-next-line @typescript-eslint/camelcase
            resp[d.date].fiat_value += d.fiat_value;
            // eslint-disable-next-line @typescript-eslint/camelcase
            resp[d.date].trade_count += d.trade_count;
          }
        });
      });

      const dailyReturn: DailyReturnValue = {
        // eslint-disable-next-line @typescript-eslint/camelcase
        stake_currency: 'USDT',
        // eslint-disable-next-line @typescript-eslint/camelcase
        fiat_display_currency: 'USD',
        data: Object.values(resp),
      };
      return dailyReturn;
    },
  };
  // Autocreate getters from botStores
  Object.keys(BotStoreGetters).forEach((e) => {
    getters[e] = (state, getters) => {
      return getters[`${state.selectedBot}/${e}`];
    };
  });

  // Create selected getters
  createAllGetters.forEach((e: string) => {
    const getterName = `all${e.charAt(0).toUpperCase() + e.slice(1)}`;
    console.log('creating getter', e, getterName);
    getters[getterName] = (state, getters) => {
      const result = {};

      getters.allAvailableBotsList.forEach((botId) => {
        result[botId] = getters[`${botId}/${e}`];
      });
      return result;
    };
  });

  const mutations = {
    selectBot(state: FTMultiBotState, botId: string) {
      if (botId in state.availableBots) {
        state.selectedBot = botId;
      } else {
        console.warn(`Botid ${botId} not available, but selected.`);
      }
    },
    setGlobalAutoRefresh(state, value: boolean) {
      state.globalAutoRefresh = value;
    },
    setRefreshing(state, refreshing: boolean) {
      state.refreshing = refreshing;
    },
    addBot(state: FTMultiBotState, bot: BotDescriptor) {
      state.availableBots[bot.botId] = bot;
    },
    removeBot(state: FTMultiBotState, botId: string) {
      if (botId in state.availableBots) {
        delete state.availableBots[botId];
      }
    },
    setRefreshInterval(state: FTMultiBotState, interval: number | null) {
      state.refreshInterval = interval;
    },
    setRefreshIntervalSlow(state: FTMultiBotState, interval: number | null) {
      state.refreshIntervalSlow = interval;
    },
  };

  const actions = {
    // Actions automatically filled below
    addBot({ dispatch, getters, commit }, bot: BotDescriptor) {
      if (Object.keys(getters.allAvailableBots).includes(bot.botId)) {
        // throw 'Bot already present';
        // TODO: handle error!
        console.log('Bot already present');
        return;
      }
      console.log('add bot', bot);
      store.registerModule(['ftbot', bot.botId], createBotSubStore(bot.botId, bot.botName));
      dispatch(`${bot.botId}/botAdded`);
      commit('addBot', bot);
    },
    removeBot({ commit, getters, dispatch }, botId: string) {
      if (Object.keys(getters.allAvailableBots).includes(botId)) {
        dispatch(`${botId}/logout`);
        store.unregisterModule([`ftbot`, botId]);
        commit('removeBot', botId);
      } else {
        console.warn(`bot ${botId} not found! could not remove`);
      }
    },
    selectFirstBot({ commit, getters }) {
      if (getters.hasBots) {
        const selBotId = localStorage.getItem(AUTH_SELECTED_BOT);
        const firstBot = Object.keys(getters.allAvailableBots)[0];
        let selBot: string | undefined = firstBot;
        if (selBotId) {
          selBot = Object.keys(getters.allAvailableBots).find((x) => x === selBotId);
        }
        commit('selectBot', getters.allAvailableBots[selBot || firstBot].botId);
      }
    },
    selectBot({ commit }, botId: string) {
      localStorage.setItem(AUTH_SELECTED_BOT, botId);
      commit('selectBot', botId);
    },
    setGlobalAutoRefresh({ commit }, value: boolean) {
      commit('setGlobalAutoRefresh', value);
    },
    allRefreshFrequent({ dispatch, getters }, forceUpdate = false) {
      getters.allAvailableBotsList.forEach((e) => {
        if (
          getters[`${e}/${BotStoreGetters.refreshNow}`] &&
          (getters[MultiBotStoreGetters.globalAutoRefresh] || forceUpdate)
        ) {
          // console.log('refreshing', e);
          dispatch(`${e}/${BotStoreActions.refreshFrequent}`);
        }
      });
    },
    allRefreshSlow({ dispatch, getters }, forceUpdate = false) {
      getters.allAvailableBotsList.forEach((e) => {
        if (
          getters[`${e}/${BotStoreGetters.refreshNow}`] &&
          (getters[MultiBotStoreGetters.globalAutoRefresh] || forceUpdate)
        ) {
          dispatch(`${e}/${BotStoreActions.refreshSlow}`, forceUpdate);
        }
      });
    },
    async allRefreshFull({ commit, dispatch, state }) {
      if (state.refreshing) {
        return;
      }
      commit('setRefreshing', true);
      try {
        // Ensure all bots status is correct.
        await dispatch('pingAll');
        const updates: Promise<AxiosInstance>[] = [];
        updates.push(dispatch('allRefreshFrequent', false));
        updates.push(dispatch('allRefreshSlow', true));
        // updates.push(dispatch('getDaily'));
        // updates.push(dispatch('getBalance'));

        await Promise.all(updates);
        console.log('refreshing_end');
      } finally {
        commit('setRefreshing', false);
      }
    },

    startRefresh({ state, dispatch, commit }) {
      console.log('Starting automatic refresh.');
      dispatch('allRefreshFull');

      if (!state.refreshInterval) {
        // Set interval for refresh
        const refreshInterval = window.setInterval(() => {
          dispatch('allRefreshFrequent');
        }, 5000);
        commit('setRefreshInterval', refreshInterval);
      }
      if (!state.refreshIntervalSlow) {
        const refreshIntervalSlow = window.setInterval(() => {
          dispatch('allRefreshSlow', false);
        }, 60000);
        commit('setRefreshIntervalSlow', refreshIntervalSlow);
      }
    },
    stopRefresh({ state, commit }: { state: FTMultiBotState; commit: any }) {
      console.log('Stopping automatic refresh.');
      if (state.refreshInterval) {
        window.clearInterval(state.refreshInterval);
        commit('setRefreshInterval', null);
      }
      if (state.refreshIntervalSlow) {
        window.clearInterval(state.refreshIntervalSlow);
        commit('setRefreshIntervalSlow', null);
      }
    },

    async pingAll({ getters, dispatch }) {
      await Promise.all(
        getters.allAvailableBotsList.map(async (e) => {
          await dispatch(`${e}/ping`);
        }),
      );
    },
    allGetState({ getters, dispatch }) {
      getters.allAvailableBotsList.forEach((e) => {
        dispatch(`${e}/getState`);
      });
    },
    allGetDaily({ getters, dispatch }, payload: DailyPayload) {
      getters.allAvailableBotsList.forEach((e) => {
        dispatch(`${e}/getDaily`, payload);
      });
    },
    async forceSellMulti({ dispatch }, forcesellPayload: MultiForcesellPayload) {
      return dispatch(`${forcesellPayload.botId}/${[BotStoreActions.forcesell]}`, forcesellPayload);
    },
    async deleteTradeMulti({ dispatch }, deletePayload: MultiDeletePayload) {
      return dispatch(
        `${deletePayload.botId}/${[BotStoreActions.deleteTrade]}`,
        deletePayload.tradeid,
      );
    },
  };
  // Autocreate Actions from botstores
  Object.keys(BotStoreActions).forEach((e) => {
    actions[e] = ({ state, dispatch, getters }, ...args) => {
      if (getters.hasBots) {
        return dispatch(`${state.selectedBot}/${e}`, ...args);
      }
      console.warn(`bot ${state.selectedBot} is not registered.`);
      return {};
    };
  });

  return {
    namespaced: true,
    // modules: {
    //   'ftbot.0': createBotSubStore('ftbot.0'),
    // },
    state,
    mutations,

    getters,
    actions,
  };
}
