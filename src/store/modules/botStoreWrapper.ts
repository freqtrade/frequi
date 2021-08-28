import { BotStoreActions, BotStoreGetters, createBotSubStore } from './ftbot';

interface FTMultiBotState {
  selectedBot: string;
  availableBots: string[];
}

export default function createBotStore() {
  const state: FTMultiBotState = {
    selectedBot: 'ftbot.0',
    availableBots: ['ftbot.0'],
  };

  // All getters working on all bots should be prefixed with all.
  const getters = {
    selectedBot(state: FTMultiBotState) {
      return state.selectedBot;
    },
    allAvailableBots(state: FTMultiBotState) {
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
    addBot({ getters, commit }, botName: string) {
      if (getters.allAvailableBots.includes(botName)) {
        // throw 'Bot already present';
        // TODO: handle error!
      }
      commit('addBot', botName);
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
    modules: {
      'ftbot.0': createBotSubStore(),
    },
    state,
    mutations,

    getters,
    actions,
  };
}
