<template>
    <div class="app-layout">
        <Navbar />
        <div class="main-content">
            <Playlist />
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
}

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

}
</style>