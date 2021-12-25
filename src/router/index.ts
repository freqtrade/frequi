import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '@/views/Home.vue';
import Error404 from '@/views/Error404.vue';
import store from '@/store';
import StoreModules from '@/store/storeSubModules';
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      allowAnonymous: true,
    },
  },
  {
    path: '/trade',
    name: 'Freqtrade Trading',
    component: () => import(/* webpackChunkName: "trade" */ '@/views/Trading.vue'),
  },
  {
    path: '/graph',
    name: 'Freqtrade Graph',
    component: () => import(/* webpackChunkName: "graph" */ '@/views/Graphs.vue'),
  },
  {
    path: '/logs',
    name: 'Freqtrade Logs',
    component: () => import(/* webpackChunkName: "graph" */ '@/views/LogView.vue'),
  },
  {
    path: '/backtest',
    name: 'Freqtrade Backtest',
    component: () => import(/* webpackChunkName: "backtest" */ '@/views/Backtesting.vue'),
  },
  {
    path: '/dashboard',
    name: 'Freqtrade Dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue'),
  },
  {
    path: '/balance',
    name: 'Freqtrade Balance',
    component: () => import(/* webpackChunkName: "balance" */ '@/components/ftbot/Balance.vue'),
  },
  {
    path: '/open_trades',
    component: () => import(/* webpackChunkName: "trades" */ '@/views/TradesList.vue'),
  },

  {
    path: '/trade_history',
    component: () => import(/* webpackChunkName: "trades" */ '@/views/TradesList.vue'),
    props: { history: true },
  },
  {
    path: '/pairlist',
    component: () =>
      import(/* webpackChunkName: "pairlist" */ '@/components/ftbot/FTBotAPIPairList.vue'),
  },
  {
    path: '/settings',
    name: 'Freqtrade Settings',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Settings.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/LoginView.vue'),
    meta: {
      allowAnonymous: true,
    },
  },
  {
    path: '*',
    name: '404',
    component: Error404,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  const hasBots = store.getters[`${StoreModules.ftbot}/${MultiBotStoreGetters.hasBots}`];
  if (!to.meta?.allowAnonymous && !hasBots) {
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
