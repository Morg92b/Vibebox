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
    padding-bottom: 150px;
}

.main-content {
    padding: 1rem;
    width: 100%;
}

.content-wrapper {
    width: 100%;
    max-width: 1400px;
    padding: 0 20px;
    margin: 0 auto;
}
</style>