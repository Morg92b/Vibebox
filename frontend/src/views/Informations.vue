<template>
    <div class="app-layout">
        <Navbar />
        <Background />
        <main class="main-content">
            <div ref="cardsContainer" class="cards-container">
                <Carteinfo v-for="(person, index) in people.slice(0, 4)" :key="index" :name="person.name"
                    :role="person.role" :photo="person.photo" :github="person.github" :linkedin="person.linkedin"
                    :class="{ 'fade-in': true, 'show': isFirstCardsMounted }" />
            </div>
            <div class="content-wrapper">
                <About />
                <Log />
            </div>
        </main>
        <Footer />
    </div>
</template>


<script setup>
import Background from '@/components/Background.vue';
import Navbar from '@/components/navbar.vue';
import Footer from '@/components/Footer.vue';
import About from '@/components/About.vue';
import Log from '@/components/Log.vue';
import Carteinfo from '@/components/Carteinfo.vue';

const people = [
    { name: 'Morgan', role: 'Developper fullstack', photo: 'morgan', github: 'https://github.com/Morg92b', linkedin: 'https://www.linkedin.com/in/morgan-bouaziz-50a2811b6/' },
];
</script>

<style scoped>
.app-layout {
    overflow-y: auto;
    max-height: 100vh;
    padding-bottom: 150px;
}


.content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin-top: 40px;
}

.cards-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}
</style>
