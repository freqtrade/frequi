import { GridItemData } from 'vue-grid-layout';

const DEFAULT_TRADING_LAYOUT: GridItemData[] = [
  { i: 'g-reloadControl', x: 0, y: 0, w: 4, h: 1 },
  { i: 'g-botControls', x: 0, y: 0, w: 4, h: 3 },
  { i: 'g-MultiPane', x: 0, y: 0, w: 4, h: 7 },
  { i: 'g-openTrades', x: 4, y: 0, w: 8, h: 5 },
  { i: 'g-tradeHistory', x: 4, y: 4, w: 8, h: 6 },
  { i: 'g-logView', x: 0, y: 9, w: 12, h: 3 },
];

const DEFAULT_DASHBOARD_LAYOUT: GridItemData[] = [
  { i: 'g-dailyChart', x: 0, y: 0, w: 4, h: 6 },
  { i: 'g-hourlyChart', x: 4, y: 0, w: 4, h: 6 },
  { i: 'g-cumChartChart', x: 0, y: 6, w: 4, h: 6 },
];

export default {
  namespaced: true,
  state: {
    dashboardLayout: JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_LAYOUT)),
    tradingLayout: JSON.parse(JSON.stringify(DEFAULT_TRADING_LAYOUT)),
  },

  getters: {
    getDashboardLayout(state) {
      return state.dashboardLayout;
    },
    getTradingLayout(state) {
      return state.tradingLayout;
    },
  },

  mutations: {
    setDashboardLayout(state, layout) {
      console.log('set dashboard layout');
      state.dashboardLayout = layout;
    },
    setTradingLayout(state, layout) {
      state.tradingLayout = layout;
    },
  },

  actions: {
    resetDashboardLayout({ commit }) {
      commit('setDashboardLayout', JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_LAYOUT)));
    },

    resetTradingLayout({ commit }) {
      commit('setTradingLayout', JSON.parse(JSON.stringify(DEFAULT_TRADING_LAYOUT)));
    },
  },
};
