<template>
    <button @click="handleSpotifyConnection" :disabled="isLoading" class="spotify-button">
        {{ isLinked ? 'Délier Spotify' : 'Lier Spotify' }}
        <span v-if="isLoading" class="loading-spinner"></span>
    </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore()
const isLinked = ref(false)
const isLoading = ref(false)

// Vérifie l'état de connexion Spotify
const checkSpotifyConnection = async () => {
    if (!authStore.userId) return;

    try {
        const response = await axios.get(`http://localhost:5500/api/auth/${authStore.userId}/spotify`);
        console.log("Réponse API Spotify:", response.data);

        isLinked.value = response.data.linked;

        if (response.data.spotifyAccessToken) {
            authStore.setSpotifyToken(response.data.spotifyAccessToken);
        }
    } catch (error) {
        console.error("Erreur vérification Spotify", error);
    }
};

// Gère le clic sur le bouton
const handleSpotifyConnection = async () => {
    if (isLoading.value || !authStore.userId) return
    isLoading.value = true

    try {
        if (isLinked.value) {
            await unlinkSpotifyAccount()
        } else {
            await linkSpotifyAccount()
        }
        await checkSpotifyConnection()
    } catch (error) {
        console.error("Erreur gestion Spotify", error)
    } finally {
        isLoading.value = false
    }
}

const linkSpotifyAccount = async () => {
    try {
        const response = await axios.get(`http://localhost:5500/api/spotify/login?userId=${authStore.userId}`);
        console.log("URL de redirection Spotify :", response.data.url);
        window.location.href = response.data.url;
    } catch (error) {
        console.error("Erreur lors de la liaison avec Spotify :", error);
    }
};

const unlinkSpotifyAccount = async () => {
    try {
        await axios.post('http://localhost:5500/api/spotify/unlink', {
            userId: authStore.userId
        })
    } catch (error) {
        console.error("Erreur déconnexion Spotify", error)
        throw error
    }
}

onMounted(() => {
    checkSpotifyConnection()
})
</script>

<style scoped>
.spotify-button {
    padding: 10px 20px;
    text-transform: uppercase;
    border-radius: 8px;
    font-size: 8px;
    font-weight: 500;
    color: #ffffff80;
    text-shadow: none;
    background: transparent;
    cursor: pointer;
    box-shadow: transparent;
    border: 1px solid #ffffff80;
    transition: 0.5s ease;
    user-select: none;
}

.spotify-button,
#btn {
    font-size: 8px;
    min-width: 140px;
    height: 33px;
}



.spotify-button:hover,
.spotify-button:focus {
    color: #ffffff;
    background: #008cff;
    border: 1px solid #008cff;
    text-shadow: 0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 20px #ffffff;
    box-shadow: 0 0 5px #008cff, 0 0 20px #008cff, 0 0 50px #008cff,
        0 0 100px #008cff;
}


.loading-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>