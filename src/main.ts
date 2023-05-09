import { createPinia, PiniaVuePlugin } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import App from './App.vue';
// Eensure Bootstrap css still loads
import './plugins/bootstrap-vue';
import { GridLayout } from './plugins/vue-grid-layout';
import router from './router';

const myApp = createApp(App);

myApp.use(PiniaVuePlugin);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
myApp.use(pinia);

myApp.use(router);
myApp.use(GridLayout);

// Vue.config.productionTip = false;
myApp.mount('#app');
