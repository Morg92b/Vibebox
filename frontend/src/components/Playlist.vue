<template>
    <div class="playlists-container">
        <h2>Playlists des utilisateurs</h2>

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
                            <p class="user-info">Posté par {{ getUsername(playlist.user) }} le {{
                                formatDate(playlist.createdAt) }}</p>
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

// État réactif
const playlists = ref([])
const usersCache = ref({})
const loading = ref(true)
const error = ref(null)
const sortBy = ref('date')
const currentPage = ref(0)
const itemsPerPage = 4
const authStore = useAuthStore()

// Tri et pagination
const sortedPlaylists = computed(() => {
    const playlistsCopy = [...playlists.value]
    switch (sortBy.value) {
        case 'date': return playlistsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        case 'name': return playlistsCopy.sort((a, b) => a.name.localeCompare(b.name))
        case 'likes': return playlistsCopy.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        default: return playlistsCopy
    }
})

const totalPages = computed(() => Math.ceil(sortedPlaylists.value.length / itemsPerPage))
const paginatedPlaylists = computed(() => {
    const start = currentPage.value * itemsPerPage
    return sortedPlaylists.value.slice(start, start + itemsPerPage)
})

const nextPage = () => currentPage.value < totalPages.value - 1 && currentPage.value++
const prevPage = () => currentPage.value > 0 && currentPage.value--
const resetPagination = () => currentPage.value = 0

// Fonctions utilitaires
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const getUsername = (user) => {
    return typeof user === 'object' ? user.username : 'Utilisateur inconnu'
}

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

        const response = await axios.patch(
            `http://localhost:5500/api/spotify/playlist/${endpoint}`,
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

        // Mise à jour optimiste de l'UI
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
        // Rechargement en cas d'erreur
        await fetchPlaylists();
    }
};

// Récupération des données
const fetchPlaylists = async () => {
    try {
        loading.value = true
        error.value = null

        const [playlistsRes, usersRes] = await Promise.all([
            axios.get('http://localhost:5500/api/spotify/playlist/getAllPlaylist', {
                headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
            }),
            axios.post('http://localhost:5500/api/auth/getUsersByIds', {
                userIds: [...new Set(playlists.value.map(p => p.user))]
            })
        ])

        playlists.value = playlistsRes.data
        usersRes.data.forEach(user => usersCache.value[user._id] = user)
    } catch (err) {
        error.value = err.response?.data?.error || err.message
    } finally {
        loading.value = false
    }
}

// Initialisation
onMounted(() => {
    if (authStore.isAuthenticated || !authStore.requiresAuth) {
        fetchPlaylists()
    } else {
        error.value = "Veuillez vous connecter"
    }
})
</script>

<style scoped>
.playlists-container {
    max-width: 100%;
    padding: 20px;
    overflow-x: hidden;
    width: 1000px;
}

h2 {
    text-align: center;
    margin-bottom: 15px;
    color: #1a5e9c;
    font-family: 'Arial', sans-serif;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
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
}

.playlists-horizontal {
    display: flex;
    gap: 20px;
    padding: 0 10px;
    width: max-content;
}

.playlist-card-horizontal {
    flex: 0 0 280px;
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
    padding: 15px;
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
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: white;
}

.likes-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0;
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
    padding: 8px;
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
    .controls {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }

    .playlist-card-horizontal {
        flex: 0 0 240px;
    }
}
</style>