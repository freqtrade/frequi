import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '@/views/Home.vue';
import Error404 from '@/views/Error404.vue';

import userService from '@/shared/userService';

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
  if (to.name === 'Login' && userService.loggedIn()) {
    // No login if already logged in
    next({ path: '/' });
  }
  if (!to.meta.allowAnonymous && !userService.loggedIn()) {
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
