<template>
    <div class="playlists-container">
        <h2>Playlists de {{ username }}</h2>

        <div v-if="loading" class="loading">Chargement en cours...</div>

        <div v-else-if="error" class="error">
            Erreur lors du chargement des playlists: {{ error }}
        </div>
        <div v-else>
            <div class="controls">
                <div class="sort-options">
                    <label>Trier par :</label>
                    <select v-model="sortBy" @change="resetPagination">
                        <option value="date">Date de publication</option>
                        <option value="name">Nom de playlist</option>
                        <option value="likes">Nombre de likes</option>
                    </select>
                </div>

                <div class="pagination-controls">
                    <button @click="prevPage" :disabled="currentPage === 0" class="page-btn">
                        &lt;
                    </button>
                    <span>Page {{ currentPage + 1 }} / {{ totalPages }}</span>
                    <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="page-btn">
                        &gt;
                    </button>
                </div>
            </div>

            <div class="horizontal-scroll">
                <div class="playlists-horizontal">
                    <div v-for="playlist in paginatedPlaylists" :key="playlist._id" class="playlist-card-horizontal">
                        <div class="playlist-header">
                            <h3>{{ playlist.name }}</h3>
                            <p class="user-info">Posté le {{ formatDate(playlist.createdAt) }}</p>
                        </div>

                        <div class="playlist-cover">
                            <img :src="playlist.imageUrl || 'https://via.placeholder.com/300'"
                                :alt="'Cover de ' + playlist.name" />
                        </div>

                        <div class="playlist-info">
                            <p>{{ playlist.tracksCount }} titres</p>
                            <div class="likes-section">
                                <button @click="toggleLike(playlist._id)">
                                    {{ userLikedPlaylist(playlist._id) ? '❤️' : '🤍' }}
                                </button>
                                <span>{{ playlist.likes?.length || 0 }}</span>
                            </div>
                            <a :href="`https://open.spotify.com/playlist/${playlist.spotifyId}`" target="_blank"
                                class="spotify-link">
                                Écouter
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500";

const route = useRoute();
const authStore = useAuthStore();
const playlists = ref([]);
const username = ref('');
const loading = ref(true);
const error = ref(null);
const sortBy = ref('date');
const currentPage = ref(0);
const itemsPerPage = 6;

// Récupération des playlists de l'utilisateur
const fetchUserPlaylists = async () => {
    try {
        const userId = route.params.userId?.toString();
        console.log("User ID récupéré:", userId);

        if (!userId) {
            error.value = "ID utilisateur invalide.";
            return;
        }

        const response = await axios.get(`${BASE_URL}/api/spotify/playlist/user/${encodeURIComponent(userId)}`);
        playlists.value = response.data;

        console.log("Données reçues:", response.data);

        if (response.data.length > 0 && response.data[0].user && response.data[0].user.username) {
            username.value = response.data[0].user.username;
        } else {
            const userResponse = await axios.get(`${BASE_URL}/api/auth/getUser/${userId}`);
            username.value = userResponse.data?.username || "Utilisateur inconnu";
        }

    } catch (err) {
        error.value = err.response?.data?.error || "Impossible de récupérer les playlists";
    } finally {
        loading.value = false;
    }
};




//Tri et pagination
const sortedPlaylists = computed(() => {
    const playlistsCopy = [...playlists.value];
    switch (sortBy.value) {
        case 'date': return playlistsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'name': return playlistsCopy.sort((a, b) => a.name.localeCompare(b.name));
        case 'likes': return playlistsCopy.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        default: return playlistsCopy;
    }
});

const totalPages = computed(() => Math.ceil(sortedPlaylists.value.length / itemsPerPage));
const paginatedPlaylists = computed(() => {
    const start = currentPage.value * itemsPerPage;
    return sortedPlaylists.value.slice(start, start + itemsPerPage);
});

const nextPage = () => currentPage.value < totalPages.value - 1 && currentPage.value++;
const prevPage = () => currentPage.value > 0 && currentPage.value--;
const resetPagination = () => currentPage.value = 0;

// Gestion des likes
const userLikedPlaylist = (playlistId) => {
    if (!authStore.userId) return false;
    const playlist = playlists.value.find(p => p._id === playlistId);
    if (!playlist?.likes) return false;

    return playlist.likes.some(
        likeId => likeId.toString() === authStore.userId.toString()
    );
};

const toggleLike = async (playlistId) => {
    if (!authStore.isAuthenticated) {
        error.value = "Veuillez vous connecter";
        return;
    }

    try {
        const hasLiked = userLikedPlaylist(playlistId);
        const endpoint = hasLiked ? 'unlike' : 'like-playlist';

        await axios.patch(
            `${BASE_URL}/api/spotify/playlist/${endpoint}`,
            {
                userId: authStore.userId,
                playlistId
            },
            {
                headers: {
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        );
        const updatedPlaylists = [...playlists.value];
        const playlistIndex = updatedPlaylists.findIndex(p => p._id === playlistId);

        if (playlistIndex !== -1) {
            if (hasLiked) {
                updatedPlaylists[playlistIndex].likes = updatedPlaylists[playlistIndex].likes
                    .filter(id => id.toString() !== authStore.userId.toString());
            } else {
                updatedPlaylists[playlistIndex].likes = [
                    ...updatedPlaylists[playlistIndex].likes,
                    authStore.userId
                ];
            }
            playlists.value = updatedPlaylists;
        }

    } catch (err) {
        console.error("Erreur like/unlike:", err);
        error.value = err.response?.data?.error || "Erreur lors de la mise à jour";
        await fetchUserPlaylists();
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
onMounted(fetchUserPlaylists);
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

.playlists-container {
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    background: var(--color-background-soft);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-top: 60px;
}


h2 {
    text-align: center;
    margin-bottom: 15px;
    font-family: "Bebas Neue", sans-serif;
    font-weight: 400;
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: black;
}

@media (prefers-color-scheme: dark) {
    h2 {
        color: white;
    }
}

.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 10px;
}

.sort-options {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sort-options select {
    padding: 8px 12px;
    border-radius: 20px;
    border: 1px solid #ddd;
    background: white;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

.page-btn {
    padding: 8px 15px;
    border-radius: 50%;
    border: none;
    background: #1a5e9c;
    color: white;
    cursor: pointer;
    font-weight: bold;
}

.page-btn:disabled {
    background: #cccccc;
    cursor: not-allowed;
}

.horizontal-scroll {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 20px;
    -webkit-overflow-scrolling: touch;
}

.playlists-horizontal {
    display: flex;
    gap: 20px;
    padding: 10px 0;
    width: max-content;
    margin: 0 auto;
}

.playlist-card-horizontal {
    flex: 0 0 250px;
    background: #1a5e9c;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    display: flex;
    flex-direction: column;
}

.playlist-card-horizontal:hover {
    transform: translateY(-5px);
}

.playlist-header {
    padding: 10px;
    background: #191414;
    color: white;
}

.playlist-header h3 {
    margin: 0;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-info {
    margin: 5px 0 0;
    font-size: 0.8rem;
    color: #b3b3b3;
}

.playlist-cover img {
    width: 100%;
    height: 160px;
    object-fit: cover;
}

.playlist-info {
    padding: 10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    color: white;
}

.likes-section {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 5px 0;
}

.likes-section button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
}

.spotify-link {
    display: block;
    background: #1DB954;
    color: white;
    padding: 5px;
    border-radius: 20px;
    text-decoration: none;
    text-align: center;
    font-size: 0.9rem;
    margin-top: auto;
}

.spotify-link:hover {
    background: #1ed760;
}

.horizontal-scroll::-webkit-scrollbar {
    height: 8px;
}

.horizontal-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.horizontal-scroll::-webkit-scrollbar-thumb {
    background: #1a5e9c;
    border-radius: 10px;
}

.horizontal-scroll::-webkit-scrollbar-thumb:hover {
    background: #6de6f0;
}

@media (max-width: 768px) {
    .playlists-container {
        padding: 0.5rem;
    }

    .controls {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .playlist-card-horizontal {
        flex: 0 0 220px;
    }

    .horizontal-scroll {
        padding: 0 10px;
    }
}

@media (max-width: 480px) {
    .playlists-horizontal {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        white-space: nowrap;
        gap: 10px;
        padding: 10px;
    }

    .playlist-card-horizontal {
        flex: 0 0 auto;
        width: 160px;
        max-width: 160px;
        height: auto;
    }

    .playlist-cover img {
        width: 100%;
        height: 140px;
        object-fit: contain;
    }

    .horizontal-scroll {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 10px;
    }
}

@media (max-width: 375px) {
    .playlist-card-horizontal {
        flex: 0 0 110px;
    }

    .horizontal-scroll {
        overflow-x: auto;
        margin: 0 0 10px 0;
        padding: 0 10px;
    }

    .playlists-horizontal {
        gap: 5px;
    }

    .playlists-container {
        padding: 1rem;
        margin-bottom: 10rem;
    }

    h2 {
        font-size: 1rem;
    }
}
</style>