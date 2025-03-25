import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App)

app.use(createPinia())

app.use(router);

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Default Title';
    next();
  });

app.mount('#app')
