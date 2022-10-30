import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { initBots, useBotStore } from '@/stores/ftbotwrapper';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      allowAnonymous: true,
    },
  },
  {
    path: '/trade',
    name: 'Freqtrade Trading',
    component: () => import('@/views/Trading.vue'),
  },
  {
    path: '/graph',
    name: 'Freqtrade Graph',
    component: () => import('@/views/Graphs.vue'),
  },
  {
    path: '/logs',
    name: 'Freqtrade Logs',
    component: () => import('@/views/LogView.vue'),
  },
  {
    path: '/backtest',
    name: 'Freqtrade Backtest',
    component: () => import('@/views/Backtesting.vue'),
  },
  {
    path: '/dashboard',
    name: 'Freqtrade Dashboard',
    component: () => import('@/views/Dashboard.vue'),
  },
  {
    path: '/balance',
    name: 'Freqtrade Balance',
    component: () => import('@/components/ftbot/Balance.vue'),
  },
  {
    path: '/open_trades',
    component: () => import('@/views/TradesList.vue'),
  },

  {
    path: '/trade_history',
    component: () => import('@/views/TradesList.vue'),
    props: { history: true },
  },
  {
    path: '/pairlist',
    component: () => import('@/components/ftbot/FTBotAPIPairList.vue'),
  },
  {
    path: '/settings',
    name: 'Freqtrade Settings',
    component: () => import('@/views/Settings.vue'),
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
    path: '/(.*)*',
    name: '404',
    component: () => import('@/views/Error404.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  base: import.meta.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  // Init bots here...
  initBots();
  const botStore = useBotStore();
  if (!to.meta?.allowAnonymous && !botStore.hasBots) {
    // Forward to login if login is required
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
});

export default router;
