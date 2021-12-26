import { GridItemData } from 'vue-grid-layout';

export enum TradeLayout {
  multiPane = 'g-multiPane',
  openTrades = 'g-openTrades',
  tradeHistory = 'g-tradeHistory',
  tradeDetail = 'g-tradeDetail',
  chartView = 'g-chartView',
}

export enum DashboardLayout {
  dailyChart = 'g-dailyChart',
  botComparison = 'g-botComparison',
  allOpenTrades = 'g-allOpenTrades',
  cumChartChart = 'g-cumChartChart',
  tradesLogChart = 'g-TradesLogChart',
}

export enum LayoutGetters {
  getDashboardLayoutSm = 'getDashboardLayoutSm',
  getDashboardLayout = 'getDashboardLayout',
  getTradingLayoutSm = 'getTradingLayoutSm',
  getTradingLayout = 'getTradingLayout',
  getLayoutLocked = 'getLayoutLocked',
}

export enum LayoutActions {
  setDashboardLayout = 'setDashboardLayout',
  setTradingLayout = 'setTradingLayout',
  resetDashboardLayout = 'resetDashboardLayout',
  resetTradingLayout = 'resetTradingLayout',
  setLayoutLocked = 'setLayoutLocked',
}

export enum LayoutMutations {
  setDashboardLayout = 'setDashboardLayout',
  setTradingLayout = 'setTradingLayout',
  setLayoutLocked = 'setLayoutLocked',
}
// Define default layouts
const DEFAULT_TRADING_LAYOUT: GridItemData[] = [
  { i: TradeLayout.multiPane, x: 0, y: 0, w: 3, h: 35 },
  { i: TradeLayout.chartView, x: 3, y: 0, w: 9, h: 14 },
  { i: TradeLayout.tradeDetail, x: 3, y: 19, w: 9, h: 6 },
  { i: TradeLayout.openTrades, x: 3, y: 14, w: 9, h: 5 },
  { i: TradeLayout.tradeHistory, x: 3, y: 25, w: 9, h: 10 },
];

// Currently only multiPane is visible
const DEFAULT_TRADING_LAYOUT_SM: GridItemData[] = [
  { i: TradeLayout.multiPane, x: 0, y: 0, w: 12, h: 10 },
  { i: TradeLayout.chartView, x: 0, y: 10, w: 12, h: 0 },
  { i: TradeLayout.tradeDetail, x: 0, y: 19, w: 12, h: 0 },
  { i: TradeLayout.openTrades, x: 0, y: 8, w: 12, h: 0 },
  { i: TradeLayout.tradeHistory, x: 0, y: 25, w: 12, h: 0 },
];

const DEFAULT_DASHBOARD_LAYOUT: GridItemData[] = [
  { i: DashboardLayout.botComparison, x: 0, y: 0, w: 8, h: 6 } /* Bot Comparison */,
  { i: DashboardLayout.dailyChart, x: 8, y: 0, w: 4, h: 6 },
  { i: DashboardLayout.allOpenTrades, x: 0, y: 6, w: 8, h: 6 },
  { i: DashboardLayout.cumChartChart, x: 8, y: 6, w: 4, h: 6 },
  { i: DashboardLayout.tradesLogChart, x: 0, y: 12, w: 12, h: 4 },
];

const DEFAULT_DASHBOARD_LAYOUT_SM: GridItemData[] = [
  { i: DashboardLayout.botComparison, x: 0, y: 0, w: 12, h: 6 } /* Bot Comparison */,
  { i: DashboardLayout.allOpenTrades, x: 0, y: 6, w: 12, h: 8 },
  { i: DashboardLayout.dailyChart, x: 0, y: 14, w: 12, h: 6 },
  { i: DashboardLayout.cumChartChart, x: 0, y: 20, w: 12, h: 6 },
  { i: DashboardLayout.tradesLogChart, x: 0, y: 26, w: 12, h: 4 },
];

const STORE_DASHBOARD_LAYOUT = 'ftDashboardLayout';
const STORE_TRADING_LAYOUT = 'ftTradingLayout';
const STORE_LAYOUT_LOCK = 'ftLayoutLocked';

function getLayoutLocked() {
  const fromStore = localStorage.getItem(STORE_LAYOUT_LOCK);
  if (fromStore) {
    return JSON.parse(fromStore);
  }
  return true;
}

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
    layoutLocked: getLayoutLocked(),
  },

  getters: {
    [LayoutGetters.getDashboardLayoutSm]() {
      return [...DEFAULT_DASHBOARD_LAYOUT_SM];
    },
    [LayoutGetters.getDashboardLayout](state) {
      return state.dashboardLayout;
    },
    [LayoutGetters.getTradingLayoutSm]() {
      return [...DEFAULT_TRADING_LAYOUT_SM];
    },
    [LayoutGetters.getTradingLayout](state) {
      return state.tradingLayout;
    },
    [LayoutGetters.getLayoutLocked](state) {
      return state.layoutLocked;
    },
  },

  mutations: {
    [LayoutMutations.setDashboardLayout](state, layout) {
      state.dashboardLayout = layout;
      localStorage.setItem(STORE_DASHBOARD_LAYOUT, JSON.stringify(layout));
    },
    [LayoutMutations.setTradingLayout](state, layout) {
      state.tradingLayout = layout;
      localStorage.setItem(STORE_TRADING_LAYOUT, JSON.stringify(layout));
    },
    [LayoutMutations.setLayoutLocked](state, locked: boolean) {
      state.layoutLocked = locked;
      localStorage.setItem(STORE_LAYOUT_LOCK, JSON.stringify(locked));
    },
  },

  actions: {
    [LayoutActions.setDashboardLayout]({ commit }, layout) {
      commit(LayoutMutations.setDashboardLayout, layout);
    },
    [LayoutActions.setTradingLayout]({ commit }, layout) {
      commit(LayoutMutations.setTradingLayout, layout);
    },
    [LayoutActions.setLayoutLocked]({ commit }, locked: boolean) {
      commit(LayoutMutations.setLayoutLocked, locked);
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
