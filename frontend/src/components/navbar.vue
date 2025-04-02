<template>
    <header>
        <div class="navbar">
            <div class="logo">
                <router-link to="/">
                    <img src="@/assets/vibox.png" alt="Logo Nav" class="logo-nav" />
                </router-link>
            </div>
            <ul class="links" v-if="!isMenuOpen || screenWidth > 992">
                <li v-if="!username"><router-link to="/login">Login</router-link></li>
                <li v-if="!username"><router-link to="/register">Register</router-link></li>
                <li><router-link to="/contents">Contents</router-link></li>
                <li><router-link to="/about">About</router-link></li>
            </ul>
            <div class="user_menu">
                <a href="#" class="action_btn" @click="toggleUserMenu">
                    {{ authStore.isAuthenticated ? `Welcome ${authStore.username}` : "Disconnected" }}
                </a>
                <div class="dropdown_user" :class="{ open: isUserMenuOpen }" v-if="isAuthenticated">
                    <router-link to="/settings">⚙️ Settings</router-link>
                    <a href="#" @click="handlelogout">🚪 Logout</a>
                </div>
            </div>
            <div class="toggle_btn" @click="toggleMenu" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
                <font-awesome-icon :icon="isMenuOpen ? ['fas', 'times'] : ['fas', 'bars']" :bounce="isHovered"
                    size="lg" />
            </div>
        </div>
        <div class="dropdown_menu" :class="{ open: isMenuOpen }">
            <li v-if="!username"><router-link to="/login">Login</router-link></li>
            <li v-if="!username"><router-link to="/register">Register</router-link></li>
            <li><router-link to="/contents">Contents</router-link></li>
            <li><router-link to="/about">About</router-link></li>
            <li><a href="#" class="action_btn" @click="toggleDropdownUserMenu">{{ username ? `${username}` :
                "Disconnected" }}</a></li>
            <div class="dropdown_user" :class="{ open: isDropdownUserMenuOpen }" v-if="isAuthenticated">
                <router-link to="/settings">⚙️ Settings</router-link>
                <a href="#" @click="handlelogout">🚪 Logout</a>
            </div>
        </div>
    </header>
</template>



<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { logout } from "../stores/authService";

const isMenuOpen = ref(false);
const isHovered = ref(false);
const authStore = useAuthStore();
const isUserMenuOpen = ref(false);
const isDropdownUserMenuOpen = ref(false);

const username = computed(() => authStore.username);
const screenWidth = ref(window.innerWidth);

const updateScreenWidth = () => {
    screenWidth.value = window.innerWidth;
};

onMounted(() => {
    window.addEventListener("resize", updateScreenWidth);
});

onUnmounted(() => {
    window.removeEventListener("resize", updateScreenWidth);
});

const toggleMenu = () => {
    if (screenWidth.value <= 992) {
        isMenuOpen.value = !isMenuOpen.value;
    }
};

const toggleUserMenu = () => {
    if (authStore.token) {
        isUserMenuOpen.value = !isUserMenuOpen.value;
    } else {
        redirectToRegister();
    }
};

const toggleDropdownUserMenu = () => {
    if (authStore.token) {
        isDropdownUserMenuOpen.value = !isDropdownUserMenuOpen.value;
    } else {
        redirectToRegister();
    }
};

const router = useRouter();

const handlelogout = async () => {
    try {
        await logout(authStore, router);
        console.log('Déconnexion réussie');
    } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
    }
};

const redirectToRegister = () => {
    router.push("/login");
};

const isAuthenticated = computed(() => !!authStore.token);
</script>


<style scoped>
li {
    list-style: none;
}

a {
    text-decoration: none;
    color: #fff;
    /* Blanc */
    font-size: 1rem;
}

a:hover {
    color: rgba(24, 24, 24, 0.75);
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 0 2rem;
    background: rgba(24, 24, 24, 0.75);
    /* Noir */
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(0px);
}

.navbar {
    width: 100%;
    height: 60px;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.navbar .logo {
    font-size: 1.5rem;
    font-weight: bold;
}

.navbar .links {
    display: flex;
    gap: 2rem;
}

.navbar .toggle_btn {
    color: #fff;
    /* Blanc */
    display: flex;
    justify-content: center;
    cursor: pointer;
    display: none;
}

.action_btn {
    background-color: #1a5e9c;
    /* Bleu foncé */
    color: #fff;
    /* Blanc */
    padding: 0.5rem 1rem;
    border: none;
    outline: none;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action_btn:hover {
    transform: scale(1.05);
    background-color: #144a7c;
    /* Bleu légèrement plus foncé */
    color: #fff;
}

.action_btn:active {
    transform: scale(0.95);
}

/* Menu dropdown */
.dropdown_menu {
    position: fixed;
    display: none;
    right: 2rem;
    top: 60px;
    height: 0;
    width: 300px;
    background: rgba(24, 24, 24, 0.92);
    /* Noir avec transparence */
    backdrop-filter: blur(12px);
    border-radius: 10px;
    overflow: hidden;
    transition: height 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 9999;
    border: 1px solid transparent;
}

.dropdown_menu.open {
    height: 260px;
    border-color: #1a5e9c;
}

.dropdown_menu li {
    padding: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease;
}

.dropdown_menu li:hover {
    background-color: #1a5e9c;
    /* Bleu foncé */
}

.dropdown_menu .action_btn {
    width: 100%;
    display: flex;
    justify-content: center;
}

.logo-nav {
    height: 110px;
    margin-top: 10px;
}

.user_menu {
    position: relative;
}

.dropdown_user {
    display: none;
    position: absolute;
    right: -1rem;
    top: 39.9px;
    width: 200px;
    background: rgba(24, 24, 24, 0.92);
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    z-index: 999;
    border: 1px solid #1a5e9c;
    backdrop-filter: blur(12px);
}

.dropdown_user.open {
    display: block;
}

.dropdown_user a {
    display: block;
    padding: 10px;
    color: #fff;
    /* Blanc */
    text-align: center;
    transition: background-color 0.3s ease;
}

.dropdown_user a:hover {
    background: #1a5e9c;
    /* Bleu foncé */
}

/* Responsive Navbar */
@media (max-width: 992px) {

    .navbar .links,
    .navbar .action_btn {
        display: none;
    }

    .navbar .toggle_btn {
        display: block;
    }

    .dropdown_menu {
        display: block;
    }

    .user_menu {
        position: relative;
    }

    .dropdown_user {
        right: 5.5rem;
        top: 125px;
    }
}

@media (max-width: 576px) {
    .user_menu {
        position: relative;
    }

    .dropdown_menu {
        left: 2rem;
        width: calc(100% - 4rem);
    }

    .dropdown_user {
        right: 3rem;
    }
}
</style>