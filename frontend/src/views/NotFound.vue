<template>
    <div class="app-layout">
        <Background />
        <Error />
        <Button label="Retour" route="/" @navigate="navigateToPage" />
    </div>
</template>

<script setup>
import Background from '@/components/Background.vue';
import Error from '@/components/Error.vue';
import Button from '@/components/button.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const navigateToPage = (route) => {
    router.push(route);
};
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80vh;
    gap: 20px;
}
</style>