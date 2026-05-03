import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      allowAnonymous: true,
    },
  },
  {
    path: '/trade',
    name: 'Freqtrade Trading',
    component: () => import('@/views/TradingView.vue'),
  },
  {
    path: '/graph',
    name: 'Freqtrade Graph',
    redirect: '/trade',
  },
  {
    path: '/logs',
    name: 'Freqtrade Logs',
    redirect: { path: '/more', query: { tab: 'logs' } },
  },
  {
    path: '/backtest',
    name: 'Freqtrade Backtest',
    component: () => import('@/views/BacktestWorkspace.vue'),
  },
  {
    path: '/dashboard',
    name: 'Freqtrade Dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
  {
    path: '/balance',
    name: 'Freqtrade Balance',
    component: () => import('@/components/ftbot/BotBalance.vue'),
  },
  {
    path: '/open_trades',
    component: () => import('@/views/MobileTradesListView.vue'),
  },

  {
    path: '/trade_history',
    component: () => import('@/views/MobileTradesListView.vue'),
    props: { history: true },
  },
  {
    path: '/pairlist',
    component: () => import('@/components/ftbot/PairListLive.vue'),
  },
  {
    path: '/settings',
    name: 'Freqtrade Settings',
    redirect: { path: '/more', query: { tab: 'settings' } },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      allowAnonymous: true,
    },
  },
  {
    path: '/pairlist_config',
    name: 'Pairlist Configuration',
    redirect: { path: '/more', query: { tab: 'pairlist-config' } },
  },
  {
    path: '/download_data',
    name: 'Download Data',
    redirect: { path: '/more', query: { tab: 'download-data' } },
  },
  {
    path: '/intelligence',
    name: 'Signal Intelligence',
    component: () => import('@/views/IntelligenceWorkspace.vue'),
  },
  {
    path: '/markets',
    name: 'Prediction Markets',
    component: () => import('@/views/MarketsWorkspace.vue'),
  },
  {
    path: '/more',
    name: 'Operations',
    component: () => import('@/views/MoreWorkspace.vue'),
  },
  {
    path: '/regime',
    name: 'Regime Detector',
    redirect: { path: '/intelligence', query: { tab: 'regime-signals' } },
  },
  {
    path: '/signals',
    name: 'Signal Confidence',
    redirect: { path: '/intelligence', query: { tab: 'regime-signals' } },
  },
  {
    path: '/risk',
    name: 'Risk Dashboard',
    component: () => import('@/views/RiskDashboard.vue'),
  },
  {
    path: '/backtest-runner',
    name: 'Backtest Runner',
    redirect: { path: '/backtest', query: { tab: 'runner' } },
  },
  {
    path: '/learning',
    name: 'Learning Loop',
    redirect: { path: '/intelligence', query: { tab: 'learning' } },
  },
  {
    path: '/tqi-metrics',
    name: 'TQI & Regime Metrics',
    redirect: { path: '/intelligence', query: { tab: 'trend-quality' } },
  },
  {
    path: '/(.*)*',
    name: '404',
    component: () => import('@/views/Error404View.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  // Init bots here...
  initBots();
  const botStore = useBotStore();
  if (!to.meta?.allowAnonymous && !botStore.hasBots) {
    // Forward to login if login is required
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    };
  } else {
    return true;
  }
});

export default router;
