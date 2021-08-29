import { BotDescriptor, BotDescriptors } from '@/types';
import { BotStoreActions, BotStoreGetters, createBotSubStore } from './ftbot';

interface FTMultiBotState {
  selectedBot: string;
  availableBots: BotDescriptors;
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
    availableBots: {},
  };

  // All getters working on all bots should be prefixed with all.
  const getters = {
    [MultiBotStoreGetters.hasBots](state: FTMultiBotState): boolean {
      return Object.keys(state.availableBots).length > 0;
    },
    [MultiBotStoreGetters.selectedBot](state: FTMultiBotState): string {
      return state.selectedBot;
    },
    [MultiBotStoreGetters.allAvailableBots](state: FTMultiBotState): BotDescriptors {
      return state.availableBots;
    },
    [MultiBotStoreGetters.nextBotId](state: FTMultiBotState): string {
      let botCount = Object.keys(state.availableBots).length;

      while (`ftbot.${botCount}` in state.availableBots) {
        botCount += 1;
      }
      return `ftbot.${botCount}`;
    },
  };
  // Autocreate getters from botStores
  Object.keys(BotStoreGetters).forEach((e) => {
    getters[e] = (state, getters) => {
      return getters[`${state.selectedBot}/${e}`];
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
    addBot(state: FTMultiBotState, bot: BotDescriptor) {
      state.availableBots[bot.botId] = bot;
    },
    removeBot(state: FTMultiBotState, botId: string) {
      if (botId in state.availableBots) {
        delete state.availableBots[botId];
      }
    },
  };

  const actions = {
    // Actions automatically filled below
    addBot({ getters, commit }, bot: BotDescriptor) {
      if (Object.keys(getters.allAvailableBots).includes(bot.botId)) {
        // throw 'Bot already present';
        // TODO: handle error!
        console.log('Bot already present');
        return;
      }
      console.log('add bot', bot);
      store.registerModule(['ftbot', bot.botId], createBotSubStore(bot.botId));
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
        const firstBot = Object.keys(getters.allAvailableBots)[0];
        console.log(firstBot);
        commit('selectBot', getters.allAvailableBots[firstBot].botId);
      }
    },
    selectBot({ commit }, botId: string) {
      commit('selectBot', botId);
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
