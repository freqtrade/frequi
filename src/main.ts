import Vue from 'vue';
import './plugins/bootstrap-vue';
import App from './App.vue';
import store from './store';
import router from './router';
import { initApi } from './shared/apiService';

initApi(store);

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');
