<template>
    <div class="app-layout">
        <Navbar />
        <div class="main-content">
            <div class="content-wrapper">
                <Playlist />
            </div>
        </div>
        <Footer />
    </div>
</template>

<script setup>
import Navbar from '@/components/navbar.vue';
import Footer from '@/components/Footer.vue';
import Playlist from '@/components/Playlist.vue';
</script>

<style scoped>
.app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 1rem;
    width: 100%;
}

.content-wrapper {
    width: 100%;
    max-width: 1400px;
    /* Ajustez selon vos besoins */
}
</style>