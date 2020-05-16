import axios from 'axios';

import { apiBase } from './config';

const AUTH_REF_TOKEN = 'auth_ref_token';
const AUTH_ACCESS_TOKEN = 'auth_access_token';

const initAccessToken = JSON.parse(localStorage.getItem(AUTH_ACCESS_TOKEN));

export default {
  namespaced: true,
  state: {
    loggedIn: initAccessToken ? 1 !== 2 : false,
    accessToken: initAccessToken,
  },
  getters: {
    apiAuth(state) {
      // const token = JSON.parse(localStorage.getItem('auth'));
      let result = {}
      if (state.accessToken) {
        result = {
            Authorization: `Bearer ${state.accessToken}`,
        };
      }
      else {
        console.log("user not logged in");
      }
      return result;
    },
  },
  mutations: {
    setAccessTokens(state, token) {
      localStorage.setItem(AUTH_ACCESS_TOKEN, JSON.stringify(token));
      state.accessToken = token;
      state.loggedIn = true;
    },
    setRefreshTokens(state, token) {
      localStorage.setItem(AUTH_REF_TOKEN, JSON.stringify(token));
    },
    setLogin(state, tokens) {
      localStorage.setItem('ftloggedin', true);
      state.tokens = tokens;
      state.loggedIn = true;
    },
    logout(state) {
      console.log("Logging out");
      localStorage.removeItem(AUTH_REF_TOKEN);
      localStorage.removeItem(AUTH_ACCESS_TOKEN);

      state.auth = null;
      state.loggedIn = false;
    }
  },
  actions: {
    login({ commit }, auth) {
      //  Login using username / password
      console.log(auth);
      axios.post(`${apiBase}/token/login`, {}, {
        auth: { ...auth }
      })
        .then((result) => {
          console.log(result.data);

          // if (result.data.login === true) {

          // commit('setLogin');
          // }
          if (result.data.access_token) {
            commit('setAccessTokens', result.data.access_token)
          }
          if (result.data.refresh_token) {
            commit('setRefreshTokens', result.data.refresh_token)
          }
        })
        .catch(console.error);
    },
    refresh_token({ commit, dispatch }) {
      console.log("Refreshing token...")
      const token = JSON.parse(localStorage.getItem(AUTH_REF_TOKEN));
      axios.post(`${apiBase}/token/refresh`, {}, {
        headers: { Authorization: `Bearer ${token}` },

      })
        .then((result) => {
          if (result.data.access_token) {
            commit('setAccessTokens', result.data.access_token);
          }
        })
        .catch((error) => {
          console.error(error);
          // in case of errors when using the refresh token - logout.
          dispatch('logout');
        });
    },

    logout({ commit, state }) {
      if (state.loggedIn) {

        commit('logout');
      }
      else {
        console.log('Not logged in');
      }
    },
  },
};
