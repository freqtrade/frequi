import { BotStoreActions, BotStoreGetters, createBotSubStore } from './ftbot';

interface FTMultiBotState {
  selectedBot: string;
  availableBots: string[];
}

export default function createBotStore(store) {
  const state: FTMultiBotState = {
    selectedBot: 'ftbot.0',
    availableBots: [],
  };

  // All getters working on all bots should be prefixed with all.
  const getters = {
    hasBots(state: FTMultiBotState): boolean {
      return state.availableBots.length > 0;
    },
    selectedBot(state: FTMultiBotState): string {
      return state.selectedBot;
    },
    allAvailableBots(state: FTMultiBotState): string[] {
      return state.availableBots;
    },
  };
  // Autocreate getters
  Object.keys(BotStoreGetters).forEach((e) => {
    getters[e] = (state, getters) => {
      return getters[`${state.selectedBot}/${e}`];
    };
  });

  const mutations = {
    addBot(state: FTMultiBotState, botName: string) {
      state.availableBots = [...state.availableBots, botName];
    },
  };

  const actions = {
    // Actions automatically filled below
    addBot({ getters, commit }, botId: string) {
      if (getters.allAvailableBots.includes(botId)) {
        // throw 'Bot already present';
        // TODO: handle error!
      }
      console.log('add bot', botId);
      store.registerModule(`ftbot/${botId}`, createBotSubStore(botId));
      commit('addBot', botId);
    },
  };
  // Autocreate Actions
  Object.keys(BotStoreActions).forEach((e) => {
    actions[e] = ({ state, dispatch }, ...args) => {
      return dispatch(`${state.selectedBot}/${e}`, ...args);
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
