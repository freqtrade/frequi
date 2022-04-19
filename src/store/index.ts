import Vue from 'vue';
import Vuex from 'vuex';

import { getCurrentTheme, getTheme, storeCurrentTheme } from '@/shared/themes';
import axios from 'axios';
import { UiVersion } from '@/types';

Vue.use(Vuex);
const initCurrentTheme = getCurrentTheme();

const store = new Vuex.Store({
  state: {
    currentTheme: initCurrentTheme,
    uiVersion: 'dev',
  },
  getters: {
    isDarkTheme(state) {
      const theme = getTheme(state.currentTheme);
      if (theme) {
        return theme.dark;
      }
      return true;
    },
    getChartTheme(state, getters) {
      return getters.isDarkTheme ? 'dark' : 'light';
    },
    getUiVersion(state) {
      return state.uiVersion;
    },
  },
  mutations: {
    mutateCurrentTheme(state, newTheme: string) {
      storeCurrentTheme(newTheme);
      state.currentTheme = newTheme;
    },
    setUIVersion(state, uiVersion: string) {
      state.uiVersion = uiVersion;
    },
  },
  actions: {
    setCurrentTheme({ commit }, newTheme: string) {
      commit('mutateCurrentTheme', newTheme);
    },
    async loadUIVersion({ commit }) {
      if (import.meta.env.PROD) {
        try {
          const result = await axios.get<UiVersion>('/ui_version');
          const { version } = result.data;

          commit('setUIVersion', version);
        } catch (error) {
          //
        }
      }
    },
  },
});

export default store;
