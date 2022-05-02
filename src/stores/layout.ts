import { defineStore } from 'pinia';
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

const STORE_LAYOUTS = 'ftLayoutSettings';

function migrateLayoutSettings() {
  const STORE_DASHBOARD_LAYOUT = 'ftDashboardLayout';
  const STORE_TRADING_LAYOUT = 'ftTradingLayout';
  const STORE_LAYOUT_LOCK = 'ftLayoutLocked';

  // If new does not exist
  if (localStorage.getItem(STORE_DASHBOARD_LAYOUT) !== null) {
    console.log('Migrating dashboard settings');
    const layoutLocked = localStorage.getItem(STORE_LAYOUT_LOCK);
    const tradingLayout = localStorage.getItem(STORE_TRADING_LAYOUT);
    const dashboardLayout = localStorage.getItem(STORE_DASHBOARD_LAYOUT);

    const res = {
      dashboardLayout,
      tradingLayout,
      layoutLocked,
    };
    localStorage.setItem(STORE_LAYOUTS, JSON.stringify(res));
  }
  localStorage.removeItem(STORE_LAYOUT_LOCK);
  localStorage.removeItem(STORE_TRADING_LAYOUT);
  localStorage.removeItem(STORE_DASHBOARD_LAYOUT);
}
migrateLayoutSettings();
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

export const useLayoutStore = defineStore('layoutStore', {
  state: () => {
    return {
      dashboardLayout: JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_LAYOUT)),
      tradingLayout: JSON.parse(JSON.stringify(DEFAULT_TRADING_LAYOUT)),
      layoutLocked: true,
    };
  },
  getters: {
    getDashboardLayoutSm: () => [...DEFAULT_DASHBOARD_LAYOUT_SM],
    getTradingLayoutSm: () => [...DEFAULT_TRADING_LAYOUT_SM],
  },
  actions: {
    resetTradingLayout() {
      this.tradingLayout = JSON.parse(JSON.stringify(DEFAULT_TRADING_LAYOUT));
    },
    resetDashboardLayout() {
      this.dashboardLayout = JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_LAYOUT));
    },
  },
  persist: {
    key: STORE_LAYOUTS,
    afterRestore: (context) => {
      console.log('after restore - ', context.store);
      if (
        context.store.dashboardLayout === null ||
        typeof context.store.dashboardLayout === 'string'
      ) {
        context.store.dashboardLayout = JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_LAYOUT));
      }
      if (context.store.tradingLayout === null || typeof context.store.tradingLayout === 'string') {
        context.store.tradingLayout = JSON.parse(JSON.stringify(DEFAULT_TRADING_LAYOUT));
      }
    },
  },
});
