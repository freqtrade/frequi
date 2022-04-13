import Vue from 'vue';
import './plugins/bootstrap-vue';
import './plugins/composition_api';
import App from './App.vue';
import store from './store';
import router from './router';
import { initApi } from './shared/apiService';
import { createPinia, PiniaVuePlugin } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

initApi(store);

Vue.use(PiniaVuePlugin);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: (h) => h(App),
  pinia,
}).$mount('#app');
