<template>
  <div class="navbar-container" v-if="isAuthenticated">
    <button class="toggle-btn" @click="toggleExpandedMenu">
      <font-awesome-icon :icon="['fas', isExpanded ? 'chevron-up' : 'chevron-down']" size="sm" />
    </button>
    <transition name="slide">
      <div v-if="isExpanded" class="expanded-menu">
        <BoutonSpo v-if="authStore.isAuthenticated" />
        <BoutonAdd />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import BoutonSpo from './BoutonSpo.vue';
import BoutonAdd from './BoutonAdd.vue';

const authStore = useAuthStore();
const isExpanded = ref(false);

const isAuthenticated = computed(() => !!authStore.token);

const toggleExpandedMenu = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped>
.navbar-container {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.expanded-menu {
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: rgba(24, 24, 24, 0.92);
  border-radius: 10px;
  overflow: hidden;
  gap: 1rem;
  padding: 0.5rem;
  width: 100vw;
  max-width: 600px;
}

.expanded-menu a {
  padding: 0.5rem;
  color: #fff;
  text-align: center;
  transition: background-color 0.3s ease;
  text-decoration: none;
}

.expanded-menu a:hover {
  background: #1a5e9c;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
}

.slide-enter {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-leave {
  transform: translateY(0);
  opacity: 1;
}

.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>