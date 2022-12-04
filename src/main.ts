import { createApp } from 'vue';
import { BootstrapVue3 } from './plugins/bootstrap-vue';
import App from './App.vue';
import router from './router';
import { createPinia, PiniaVuePlugin } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import GridLayout from 'vue3-drr-grid-layout';

const myApp = createApp(App);

myApp.use(PiniaVuePlugin);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
myApp.use(pinia);

myApp.use(router);
myApp.use(BootstrapVue3);
myApp.use(GridLayout);

// Vue.config.productionTip = false;
myApp.mount('#app');
