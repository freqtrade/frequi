import { GridItemData } from 'vue-grid-layout';

export enum TradeLayout {
  botControls = 'g-botControls',
  multiPane = 'g-multiPane',
  openTrades = 'g-openTrades',
  tradeHistory = 'g-tradeHistory',
  logView = 'g-logView',
}

export enum DashboardLayout {
  dailyChart = 'g-dailyChart',
  hourlyChart = 'g-hourlyChart',
  cumChartChart = 'g-cumChartChart',
}

// Define default layouts
const DEFAULT_TRADING_LAYOUT: GridItemData[] = [
  { i: TradeLayout.botControls, x: 0, y: 0, w: 4, h: 4 },
  { i: TradeLayout.multiPane, x: 0, y: 0, w: 4, h: 7 },
  { i: TradeLayout.openTrades, x: 4, y: 0, w: 8, h: 5 },
  { i: TradeLayout.tradeHistory, x: 4, y: 4, w: 8, h: 6 },
  { i: TradeLayout.logView, x: 0, y: 9, w: 12, h: 3 },
];

const DEFAULT_DASHBOARD_LAYOUT: GridItemData[] = [
  { i: DashboardLayout.dailyChart, x: 0, y: 0, w: 4, h: 6 },
  { i: DashboardLayout.hourlyChart, x: 4, y: 0, w: 4, h: 6 },
  { i: DashboardLayout.cumChartChart, x: 0, y: 6, w: 4, h: 6 },
];

const STORE_DASHBOARD_LAYOUT = 'ftDashboardLayout';
const STORE_TRADING_LAYOUT = 'ftTradingLayout';

function getLayout(storageString: string, defaultLayout: GridItemData[]) {
  const fromStore = localStorage.getItem(storageString);
  if (fromStore) {
    return JSON.parse(fromStore);
  }

  return JSON.parse(JSON.stringify(defaultLayout));
}

/**
 * Helper function finding a layout entry
 * @param gridLayout Array of grid layouts used in this layout. Must be passed to GridLayout, too.
 * @param name Name within the dashboard layout to find
 */
export function findGridLayout(gridLayout: GridItemData[], name: string): GridItemData {
  let layout = gridLayout.find((value) => value.i === name);
  if (!layout) {
    layout = { i: name, x: 0, y: 0, w: 4, h: 6 };
  }
  return layout;
}

export default {
  namespaced: true,
  state: {
    dashboardLayout: getLayout(STORE_DASHBOARD_LAYOUT, DEFAULT_DASHBOARD_LAYOUT),
    tradingLayout: getLayout(STORE_TRADING_LAYOUT, DEFAULT_TRADING_LAYOUT),
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
      localStorage.setItem(STORE_DASHBOARD_LAYOUT, JSON.stringify(layout));
    },
    setTradingLayout(state, layout) {
      state.tradingLayout = layout;
      localStorage.setItem(STORE_TRADING_LAYOUT, JSON.stringify(layout));
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
