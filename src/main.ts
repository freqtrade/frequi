import Vue from 'vue';
import './plugins/bootstrap-vue';
import App from './App.vue';
import router from './router';
import { createPinia, PiniaVuePlugin } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import VueRouter from 'vue-router';

Vue.use(PiniaVuePlugin);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

Vue.use(VueRouter);

Vue.config.productionTip = false;
new Vue({
  router,
  render: (h) => h(App),
  pinia,
}).$mount('#app');
