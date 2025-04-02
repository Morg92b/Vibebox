import './assets/main.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/authStore';


library.add(fas);

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon);
app.use(createPinia())
app.use(router);

const authStore = useAuthStore();
authStore.initialize();
router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Default Title';
    next();
  });
  
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    console.log('État actuel de authStore :', authStore.username, authStore.token);
  
    if (to.meta.requiresAuth && !authStore.token) {
      console.error('Accès refusé : utilisateur non authentifié');
      next('/login');
    } else {
      console.log('Accès autorisé');
      next();
    }
  });

app.mount('#app');
