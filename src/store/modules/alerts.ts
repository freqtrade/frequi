export default {
  namespaced: true,
  state: {
    activeMessages: [],
  },
  mutations: {
    addAlert(state, message) {
      console.log(`adding message '${message.message}' to message queue`);
      state.activeMessages.push(message);
    },
    removeAlert(state) {
      state.activeMessages.shift();
    },
  },
  actions: {
    addAlert({ commit }, message) {
      commit('addAlert', message);
    },
  },
};
