import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
//import NotFound from '@/views/NotFound.vue';


const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home, 
    meta: {
      title: 'Vibebox'
    }
  },
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Vibebox Login'
    }
  },
  {
    path: '/Register',
    name: 'Register',
    component: Register,
    meta: {
      title: 'Vibebox Register'
    }
  }
  /*{
    path: '/:pathMatch(.*)*',
    component: NotFound,
  },*/
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;