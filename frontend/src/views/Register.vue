<template>
    <div class="app-layout">
        <Navbar />
        <Background />
        <main class="main-content">
            <div class="content-wrapper">
                <Register :username="username" :email="email" :password="password" :confirmpassword="confirmpassword"
                    :errorMessage="errorMessage" @update:username="username = $event" @update:email="email = $event"
                    @update:password="password = $event" @update:confirmpassword="confirmpassword = $event"
                    @submit="handleRegister" :class="{ 'fade-in': true, 'show': isMounted }" />
            </div>
        </main>
        <Footer />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Register from '@/components/registcard.vue';
import { useRouter } from 'vue-router';
import Background from '@/components/Background.vue';
import Footer from '@/components/Footer.vue';
import Navbar from '@/components/navbar.vue';
import { useAuthStore } from '../stores/authStore';
import { register } from '../stores/authService';

const username = ref('');
const email = ref('');
const password = ref('');
const confirmpassword = ref('');
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();
const isMounted = ref(false);

onMounted(() => {
    setTimeout(() => {
        isMounted.value = true;
    }, 150);
});

const handleRegister = async () => {
    const credentials = {
        username: username.value,
        email: email.value,
        password: password.value,
        confirmpassword: confirmpassword.value
    };

    console.log('Données envoyées au backend:', credentials);

    try {
        await register(credentials, authStore, router);
        console.log('Register Sucessfull');

        alert('Register completed!');
        router.push('/login');
    } catch (error) {
        errorMessage.value = error.message;
        console.error('Error during registration:', error);
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

.fade-in {
    opacity: 0;
    transition: opacity 1s ease-in-out;
}

.fade-in.show {
    opacity: 1;
}
</style>