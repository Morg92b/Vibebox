<template>
    <div class="sound-control">
        <input type="checkbox" id="checkboxInput" v-model="isSoundOn" @change="handleAudio">
        <label for="checkboxInput" class="toggleSwitch">
            <div class="speaker" :class="{ hidden: !isSoundOn }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75">
                    <path
                        d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
                        style="stroke:#fff;stroke-width:5;stroke-linejoin:round;fill:#fff;" />
                    <path
                        d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6"
                        style="fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round" />
                </svg>
            </div>
            <div class="mute-speaker" :class="{ hidden: isSoundOn }">
                <svg viewBox="0 0 75 75" stroke="#fff" stroke-width="5">
                    <path d="m39,14-17,15H6V48H22l17,15z" fill="#fff" stroke-linejoin="round" />
                    <path d="m49,26 20,24m0-24-20,24" fill="#fff" stroke-linecap="round" />
                </svg>
            </div>
        </label>
        <audio ref="audioPlayer" loop>
            <source src="../assets/musichome.mp3" type="audio/mpeg">
        </audio>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isSoundOn = ref(false);
const audioPlayer = ref(null);
const hasInteracted = ref(false);

const handleAudio = async () => {
    if (!audioPlayer.value) return;

    try {
        if (isSoundOn.value) {
            await audioPlayer.value.play();
            console.log("Musique démarrée");
        } else {
            audioPlayer.value.pause();
        }
    } catch (error) {
        console.error("Erreur de lecture:", error);
        isSoundOn.value = !isSoundOn.value;
    }
};

onMounted(() => {
    // Configuration initiale
    if (audioPlayer.value) {
        audioPlayer.value.volume = 0.05;
        audioPlayer.value.load();
    }

    // Gestion du premier clic n'importe où sur la page
    const handleFirstInteraction = () => {
        if (!hasInteracted.value) {
            hasInteracted.value = true;
            isSoundOn.value = true; // On force l'état à "on"
            handleAudio(); // On lance la lecture
        }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
});
</script>

<style scoped>
.sound-control {
    display: inline-block;
}

.toggleSwitch {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(39, 39, 39);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.13);
    position: relative;
}

#checkboxInput {
    display: none;
}

.speaker,
.mute-speaker {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s ease;
}

.speaker svg,
.mute-speaker svg {
    width: 18px;
    height: 18px;
}

.hidden {
    opacity: 0;
    pointer-events: none;
}

.toggleSwitch:active {
    transform: scale(0.9);
}

.toggleSwitch:hover {
    background-color: rgb(61, 61, 61);
}
</style>