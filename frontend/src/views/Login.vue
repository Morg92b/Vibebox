<template>
    <div class="app-layout">
        <Navbar />
        <Background />
        <main class="main-content">
            <div class="content-wrapper">
                <LoginCard :email="email" :password="password" :errorMessage="errorMessage"
                    @update:email="email = $event" @update:password="password = $event" @submit="onSubmit"
                    :class="{ 'fade-in': true, 'show': isMounted }" />
            </div>
        </main>
        <Footer />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '@/components/navbar.vue';
import LoginCard from '@/components/logincard.vue';
import { login } from '../stores/authService';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import Background from '@/components/Background.vue';
import Footer from '@/components/Footer.vue'; // Import ajouté

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const authStore = useAuthStore();
const router = useRouter();
const isMounted = ref(false);

onMounted(() => {
    setTimeout(() => {
        isMounted.value = true;
    }, 150);
});

const onSubmit = async () => {
    const credentials = {
        email: email.value,
        password: password.value
    };

    console.log('Tentative de connexion avec les credentials :', credentials);

    try {
        await login(credentials, authStore, router);
        console.log('Connexion réussie');
    } catch (error) {
        errorMessage.value = error.message;
        console.error('Erreur lors de la tentative de connexion :', error);
    }
};
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
}

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 80px - 60px);
}

.content-wrapper {
    width: 100%;
    max-width: 500px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Animation */
.fade-in {
    opacity: 0;
    transition: opacity 1s ease-in-out;
}

.fade-in.show {
    opacity: 1;
}
</style>
