

const userpassInit = JSON.parse(localStorage.getItem('auth'));

export default {
  namespaced: true,
  state: {
    loggedIn: userpassInit ?  1 !== 2 : false,
  },
  getters: {
    apiAuth() {
      const userpass = JSON.parse(localStorage.getItem('auth'));
      let result = {}
      if (userpass) {
        result = {
          auth: {
            username: userpass.username,
            password: userpass.password,
          }
        };
      }
      else {
        console.log("user not logged in");
      }
      return result;
    },
  },
  mutations: {
    login(state, auth) {
      localStorage.setItem('auth', JSON.stringify(auth));
      state.auth = auth;
      state.loggedIn = true;
    },
    logout(state) {
      console.log("Logging out")
      localStorage.removeItem('auth');
      state.auth = null;
      state.loggedIn = false;
    }
  },
  actions: {
    login({ commit }, auth) {
      commit('login', auth);
    },
    logout({ commit, state }) {
      if (state.loggedIn) {
        commit('logout');
      }
      else {
        console.log('Not logged in');
      }
    }
  },
};
