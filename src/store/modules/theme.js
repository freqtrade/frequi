export default {
  namespaced: true,
  state: {
    theme: 'dark',
  },
  mutations: {
    changeTheme(state, theme) {
      console.log(`Changing theme to ${theme}`);
      state.theme = theme;
    },
  },
  actions: {
    changeTheme({ commit }) {
      const dark = document.getElementById('darkthemecss');
      dark.disabled = !dark.disabled;
      const bright = document.getElementById('brightthemecss');
      bright.disabled = !bright.disabled;
      const theme = dark.disabled ? 'bright' : 'dark';
      commit('changeTheme', theme);
    },
    initTheme() {
      // Get all styles - search bootswatch.
      // Dark / bright are guessed based on import direction in bootstrap-vue.js
      const styles = document.getElementsByTagName('style');
      const bw = Array.from(styles).filter((w) => w.textContent.includes('bootswatch'));
      bw[0].id = 'darkthemecss';
      bw[1].id = 'brightthemecss';
      // Default to dark theme
      bw[1].disabled = true;
    },
  },
};
