<template>
    <div class="home-page">
        <LoginCard :email="email" :password="password" :errorMessage="errorMessage" @update:email="email = $event"
            @update:password="password = $event" @submit="onSubmit" :class="{ 'fade-in': true, 'show': isMounted }" />
    </div>
    <div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import LoginCard from '@/components/logincard.vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
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
/* Animation d'apparition en fondu */
.fade-in {
    opacity: 0;
    transition: opacity 1s ease-in-out;
}

.fade-in.show {
    opacity: 1;
}
</style>