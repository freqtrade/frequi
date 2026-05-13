import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import ui from '@nuxt/ui/vue-plugin';

import App from './App.vue';
import { VueDraggableGrid } from './plugins/vue-grid-layout';
import router from './router';
import './styles/tailwind.css';

const myApp = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
myApp.use(pinia);

myApp.use(ui);

myApp.use(router);
myApp.use(VueDraggableGrid);

// Vue.config.productionTip = false;
myApp.mount('#app');
