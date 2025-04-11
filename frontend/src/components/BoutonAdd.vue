<template>
    <div>
        <button id="btn" @click="togglePlaylists">
            {{ isPlaylistVisible ? "Masquer mes playlists" : "Afficher mes playlists" }}
        </button>

        <div v-show="isPlaylistVisible" class="playlist-container">
            <ul>
                <li v-for="playlist in playlists" :key="playlist.id">
                    {{ playlist.name }}

                    <button v-if="!authStore.savedPlaylists.some(p => p.id === playlist.id)" class="save-btn"
                        @click="postPlaylist(playlist.id)">
                        Enregistrer
                    </button>

                    <button v-if="authStore.savedPlaylists.some(p => p.id === playlist.id)" class="delete-btn"
                        @click="deletePlaylist(playlist.id)">
                        Supprimer
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>





<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { refreshSpotifyToken } from "../stores/authService";

const isPlaylistVisible = ref(false);
const playlists = ref([]);
const authStore = useAuthStore();
const savedPlaylists = ref([]);
const refreshToken = authStore.spotifyRefreshToken;
const userId = authStore.userId;

onMounted(() => {
    // Rafraîchir le token toutes les 50 minutes
    setInterval(async () => {
        await refreshSpotifyToken();
    }, 50 * 60 * 1000);
});

async function togglePlaylists() {
    if (!isPlaylistVisible.value) {
        await fetchUserPlaylists();
    }
    isPlaylistVisible.value = !isPlaylistVisible.value;
}

onMounted(() => {
    authStore.savedPlaylists = JSON.parse(localStorage.getItem("savedPlaylists")) || []; // Vérifie les playlists stockées
});

async function fetchUserPlaylists() {
    try {

        let response = await fetch("http://localhost:5500/api/spotify/playlist", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authStore.token}`,
                "Spotify-Token": `${authStore.spotifyAccessToken}`
            },
        });

        console.log("Token actuel:", authStore.token);
        console.log("User ID:", userId);
        console.log("Refresh Token:", refreshToken);

        if (response.status === 401) {
            console.warn("Token expiré, rafraîchissement en cours...");
            await refreshSpotifyToken();

            response = await fetch("http://localhost:5500/api/spotify/playlist", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authStore.token}`,
                    "Spotify-Token": `${authStore.spotifyAccessToken}`
                },
            });

            // Vérification si la deuxième tentative échoue
            if (!response.ok) {
                console.error("Échec après tentative de rafraîchissement du token :", response.status);
                return;
            }
        }

        const data = await response.json();
        if (response.ok) {
            playlists.value = data.items;

            const storedPlaylists = JSON.parse(localStorage.getItem("savedPlaylists")) || [];
            authStore.savedPlaylists = storedPlaylists.filter(p => playlists.value.some(playlist => playlist.id === p.id));

            console.log("Playlists après mise à jour :", playlists.value);
            console.log("Saved playlists :", authStore.savedPlaylists);
        } else {
            console.error("Erreur:", data.error);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des playlists:", error);
    }
};

async function postPlaylist(playlistId) {
    try {
        const response = await fetch("http://localhost:5500/api/spotify/playlist/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authStore.token}`,
                "Spotify-Token": `${authStore.spotifyAccessToken}`,
            },
            body: JSON.stringify({ playlistId }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Playlist enregistrée !");
            authStore.addPlaylist(playlistId);
        } else {
            console.error("Erreur:", data.error);
        }
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de la playlist:", error);
    }
};

async function deletePlaylist(playlistId) {
    try {
        const response = await fetch("http://localhost:5500/api/spotify/playlist/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authStore.token}`,
                "Spotify-Token": `${authStore.spotifyAccessToken}`
            },
            body: JSON.stringify({ userId: authStore.userId, playlistId }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Playlist supprimée du site !");
            authStore.removePlaylist(playlistId);

            fetchUserPlaylists();
        } else {
            console.error("Erreur:", data.error);
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de la playlist:", error);
    }
};
</script>

<style scoped>
button {
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

button,
#btn {
    font-size: 8px;
    min-width: 140px;
    height: 33px;

}

.playlist-container {
    max-height: 300px;
    overflow-y: auto;
    color: white;
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 2px;
    margin-top: 15px;
    opacity: 0;
    font-size: 15px;
    transition: opacity 0.3s ease-in-out;
}

.playlist-container[style] {
    opacity: 1;
}


.save-btn {
    padding: 5px;
    height: 25px;
    min-width: 120px;
    font-size: 10px;
    font-weight: bold;
    color: white;
    background: #1DB954;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.3s ease-in-out;
    margin-top: 5px;
}

.save-btn:hover {
    background: #1ed760;
}

.delete-btn {
    padding: 5px;
    font-size: 10px;
    min-width: 120px;
    height: 25px;
    font-weight: bold;
    color: white;
    background: #ff4d4d;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.3s ease-in-out;
    margin-left: 8px;
    margin-top: 5px;
}

.delete-btn:hover {
    background: #ff1a1a;
}




#btn:hover,
:focus {
    color: #ffffff;
    background: #008cff;
    border: 1px solid #008cff;
    text-shadow: 0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 20px #ffffff;
    box-shadow: 0 0 5px #008cff, 0 0 20px #008cff, 0 0 50px #008cff,
        0 0 100px #008cff;
}
</style>
