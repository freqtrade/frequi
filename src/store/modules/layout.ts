import { GridItemData } from 'vue-grid-layout';

export enum TradeLayout {
  botControls = 'g-botControls',
  multiPane = 'g-multiPane',
  openTrades = 'g-openTrades',
  tradeHistory = 'g-tradeHistory',
  tradeDetail = 'g-tradeDetail',
  logView = 'g-logView',
  chartView = 'g-chartView',
}

export enum DashboardLayout {
  KPI = 'g-kpi',
  dailyChart = 'g-dailyChart',
  hourlyChart = 'g-hourlyChart',
  cumChartChart = 'g-cumChartChart',
}

export enum LayoutGetters {
  getDashboardLayout = 'getDashboardLayout',
  getTradingLayout = 'getTradingLayout',
}

export enum LayoutActions {
  setDashboardLayout = 'setDashboardLayout',
  setTradingLayout = 'setTradingLayout',
  resetDashboardLayout = 'resetDashboardLayout',
  resetTradingLayout = 'resetTradingLayout',
}

export enum LayoutMutations {
  setDashboardLayout = 'setDashboardLayout',
  setTradingLayout = 'setTradingLayout',
}

// Define default layouts
const DEFAULT_TRADING_LAYOUT: GridItemData[] = [
  { i: TradeLayout.botControls, x: 0, y: 0, w: 3, h: 3 },
  { i: TradeLayout.multiPane, x: 0, y: 3, w: 3, h: 7 },
  { i: TradeLayout.chartView, x: 3, y: 0, w: 9, h: 11 },
  { i: TradeLayout.tradeDetail, x: 0, y: 11, w: 5, h: 6 },
  { i: TradeLayout.openTrades, x: 5, y: 11, w: 7, h: 5 },
  { i: TradeLayout.tradeHistory, x: 5, y: 12, w: 7, h: 6 },
  { i: TradeLayout.logView, x: 0, y: 16, w: 12, h: 3 },
];

const DEFAULT_DASHBOARD_LAYOUT: GridItemData[] = [
  { i: DashboardLayout.KPI, x: 0, y: 0, w: 4, h: 6 },
  { i: DashboardLayout.dailyChart, x: 4, y: 0, w: 4, h: 6 },
  { i: DashboardLayout.hourlyChart, x: 4, y: 6, w: 4, h: 6 },
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
    [LayoutGetters.getDashboardLayout](state) {
      return state.dashboardLayout;
    },
    [LayoutGetters.getTradingLayout](state) {
      return state.tradingLayout;
    },
  },

  mutations: {
    [LayoutMutations.setDashboardLayout](state, layout) {
      console.log('set dashboard layout');
      state.dashboardLayout = layout;
      localStorage.setItem(STORE_DASHBOARD_LAYOUT, JSON.stringify(layout));
    },
    [LayoutMutations.setTradingLayout](state, layout) {
      state.tradingLayout = layout;
      localStorage.setItem(STORE_TRADING_LAYOUT, JSON.stringify(layout));
    },
  },

  actions: {
    [LayoutActions.setDashboardLayout]({ commit }, layout) {
      commit(LayoutMutations.setDashboardLayout, layout);
    },
    [LayoutActions.setTradingLayout]({ commit }, layout) {
      commit(LayoutMutations.setTradingLayout, layout);
    },
    [LayoutActions.resetDashboardLayout]({ commit }) {
      commit(
        LayoutMutations.setDashboardLayout,
        JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_LAYOUT)),
      );
    },

    [LayoutActions.resetTradingLayout]({ commit }) {
      commit(LayoutMutations.setTradingLayout, JSON.parse(JSON.stringify(DEFAULT_TRADING_LAYOUT)));
    },
  },
};
