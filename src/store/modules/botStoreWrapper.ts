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
    addBot(state: FTMultiBotState, botId: string) {
      state.availableBots = [...state.availableBots, botId];
    },
    removeBot(state: FTMultiBotState, botId: string) {
      const index = state.availableBots.indexOf(botId);
      if (index > -1) {
        state.availableBots.splice(index, 1);
        state.availableBots = [...state.availableBots];
      }
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
      store.registerModule(['ftbot', botId], createBotSubStore(botId));
      commit('addBot', botId);
    },
    removeBot({ commit, getters }, botId: string) {
      if (getters.allAvailableBots.includes(botId)) {
        store.unregisterModule(`ftbot/${botId}`);
        commit('removeBot', botId);
      } else {
        console.warn(`bot ${botId} not found! could not remove`);
      }
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
