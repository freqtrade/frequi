import { BotStoreActions, BotStoreGetters, createBotSubStore } from './ftbot';

export default function createBotStore() {
  const state = {
    selectedBot: 'ftbot.0',
  };
  const actions = {
    // Actions automatically filled below
    addBot(context, botName: string) {
      //
    },
  };
  const getters = {};
  // Autocreate getters
  Object.keys(BotStoreGetters).forEach((e) => {
    getters[e] = (state, getters) => {
      return getters[`${state.selectedBot}/${e}`];
    };
  });
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
    getters,
    actions,
  };
}
