<style scoped>
.card {
    --font-color: #323232;
    --font-color-sub: #666;
    --bg-color: #fff;
    --main-color: #323232;
    width: 200px;
    height: 254px;
    background: var(--bg-color);
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.card-photo {
    width: 100px;
    /* Ajustez la largeur selon vos besoins */
    height: 100px;
    /* Ajustez la hauteur selon vos besoins */
    /* Chemin vers votre image */
    background-size: cover;
    /* Ajuste l'image pour couvrir toute la zone */
    background-position: center;
    /* Centre l'image */
    border-radius: 50%;
    /* Optionnel: pour un effet de photo ronde */
    margin-bottom: 10px;
    /* Espacement entre la photo et le titre */
}

.card-title {
    text-align: center;
    color: var(--font-color);
    font-size: 20px;
    font-weight: 400;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.card-title span {
    font-size: 15px;
    color: var(--font-color-sub);
}

.card-socials {
    display: flex;
    height: 0;
    opacity: 0;
    margin-top: 20px;
    gap: 20px;
    transition: 0.5s;
}

.card-socials-btn {
    width: 25px;
    height: 25px;
    border: none;
    background: transparent;
    cursor: pointer;
}

.card-socials-btn svg {
    width: 100%;
    height: 100%;
    fill: var(--main-color);
}

.card:hover>.card-socials {
    opacity: 1;
    height: 35px;
}

.card-socials-btn:hover {
    transform: translateY(-5px);
    transition: all 0.15s;
}

.card-photo:hover {
    transition: 0.3s;
    transform: scale(1.1)
}
</style>

<script setup>
import { computed } from 'vue';
const props = defineProps({
    name: String,
    role: String,
    photo: String,
    github: String,
    linkedin: String,
});

const imagePub = computed(() => {
    return new URL(`../assets/${props.photo}.png`, import.meta.url).href;
});
</script>

<template>
    <div class="card">
        <div class="card-photo" :style="{ backgroundImage: 'url(' + imagePub + ')' }"></div>
        <div class="card-title">{{ name }}<br>
            <span>{{ role }}</span>
        </div>
        <div class="card-socials">
            <a :href="github" target="_blank" class="card-socials-btn github">
                <svg viewBox="0 0 24 24" height="33" width="33" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z">
                    </path>
                </svg>
            </a>
            <a :href="linkedin" target="_blank" class="card-socials-btn linkedin">
                <svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="m51.326 185.85h90.011v270.872h-90.011zm45.608-130.572c-30.807 0-50.934 20.225-50.934 46.771 0 26 19.538 46.813 49.756 46.813h.574c31.396 0 50.948-20.814 50.948-46.813-.589-26.546-19.551-46.771-50.344-46.771zm265.405 124.209c-47.779 0-69.184 26.28-81.125 44.71v-38.347h-90.038c1.192 25.411 0 270.872 0 270.872h90.038v-151.274c0-8.102.589-16.174 2.958-21.978 6.519-16.174 21.333-32.923 46.182-32.923 32.602 0 45.622 24.851 45.622 61.248v144.926h90.024v-155.323c0-83.199-44.402-121.911-103.661-121.911z">
                    </path>
                </svg>
            </a>
        </div>
    </div>
</template>