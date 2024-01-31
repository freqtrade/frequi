import { createPinia, PiniaVuePlugin } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import App from './App.vue';
// Eensure Bootstrap css still loads
import { createBootstrap } from './plugins/bootstrap-vue';
import { VueDraggableGrid } from './plugins/vue-grid-layout';
import router from './router';

const myApp = createApp(App);

myApp.use(PiniaVuePlugin);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
myApp.use(pinia);
myApp.use(createBootstrap());

myApp.use(router);
myApp.use(VueDraggableGrid);

// Vue.config.productionTip = false;
myApp.mount('#app');
