import { BotStoreActions, BotStoreGetters, createBotSubStore } from './ftbot';

interface FTMultiBotState {
  selectedBot: string;
  availableBots: string[];
}

export enum MultiBotStoreGetters {
  hasBots = 'hasBots',
  selectedBot = 'selectedBot',
  allAvailableBots = 'allAvailableBots',
  nextBotId = 'nextBotId',
}

export default function createBotStore(store) {
  const state: FTMultiBotState = {
    selectedBot: '',
    availableBots: [],
  };

  // All getters working on all bots should be prefixed with all.
  const getters = {
    [MultiBotStoreGetters.hasBots](state: FTMultiBotState): boolean {
      return state.availableBots.length > 0;
    },
    [MultiBotStoreGetters.selectedBot](state: FTMultiBotState): string {
      return state.selectedBot;
    },
    [MultiBotStoreGetters.allAvailableBots](state: FTMultiBotState): string[] {
      return state.availableBots;
    },
    [MultiBotStoreGetters.nextBotId](state: FTMultiBotState): string {
      let botCount = state.availableBots.length;
      while (state.availableBots.includes(`ftbot.${botCount}`)) {
        botCount += 1;
      }
      return `ftbot.${botCount}`;
    },
  };
  // Autocreate getters
  Object.keys(BotStoreGetters).forEach((e) => {
    getters[e] = (state, getters) => {
      return getters[`${state.selectedBot}/${e}`];
    };
  });

  const mutations = {
    selectBot(state: FTMultiBotState, botId: string) {
      if (state.availableBots.includes(botId)) {
        state.selectedBot = botId;
      } else {
        console.warn(`Botid ${botId} not available, but selected`);
      }
    },
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
    removeBot({ commit, getters, dispatch }, botId: string) {
      if (getters.allAvailableBots.includes(botId)) {
        dispatch(`${botId}/logout`);
        store.unregisterModule([`ftbot`, botId]);
        commit('removeBot', botId);
      } else {
        console.warn(`bot ${botId} not found! could not remove`);
      }
    },
    selectFirstBot({ commit, getters }) {
      if (getters.hasBots) {
        commit('selectBot', getters.allAvailableBots[0]);
      }
    },
    selectBot({ commit }, botId: string) {
      commit('selectBot', botId);
    },
  };
  // Autocreate Actions
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
