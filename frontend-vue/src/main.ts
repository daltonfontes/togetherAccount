import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import App from './App.vue';
import router from './router';
import './lib/chart-setup';
import './assets/globals.css';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, { queryClient });

app.mount('#app');
