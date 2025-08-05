<template>
    <div class="comments-area">
        <div v-if="loading">Chargement des commentaires...</div>
        <div v-else>
            <div v-if="comments.length === 0" class="no-comments">Aucun commentaire pour l'instant.</div>

            <ul class="comments-list">
                <li v-for="comment in paginatedComments" :key="comment._id" class="comment-item">
                    <strong>{{ comment.user?.username || 'Utilisateur' }} :</strong>

                    <span v-if="editingCommentId !== comment._id" class="comment-text">
                        {{ comment.text }}
                    </span>
                    <input v-else v-model="editedText" class="edit-input" />

                    <small class="comment-date">
                        Posté le {{ formatDate(comment.createdAt) }}
                    </small>

                    <template v-if="comment.user?._id === currentUserId">
                        <div class="comment-actions">
                            <button v-if="editingCommentId !== comment._id" @click="startEditing(comment)"
                                title="Modifier">✏️</button>
                            <button v-if="editingCommentId !== comment._id" @click="deleteComment(comment._id)"
                                title="Supprimer">🗑️</button>
                            <button v-if="editingCommentId === comment._id" @click="submitEdit(comment._id)"
                                title="Valider">✅</button>
                            <button v-if="editingCommentId === comment._id" @click="cancelEdit"
                                title="Annuler">🔄</button>
                        </div>
                    </template>
                </li>
            </ul>
            <div v-if="totalPages > 1" class="pagination-controls">
                <button @click="prevPage" :disabled="currentPage === 0">⏮️</button>
                <span>Page {{ currentPage + 1 }} / {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage >= totalPages - 1">⏭️</button>
            </div>

            <form @submit.prevent="submitComment" class="comment-form">
                <input v-model="newComment" placeholder="Écrire un commentaire..." />
                <button type="submit" title="Envoyer">✔️</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500";

const props = defineProps({
    playlistId: {
        type: String,
        required: true
    }
});

const comments = ref([]);
const newComment = ref('');
const loading = ref(false);
const editingCommentId = ref(null);
const editedText = ref('');
const currentUserId = ref(null);
const currentPage = ref(0);
const commentsPerPage = 5;

onMounted(() => {
    const tokenPayload = JSON.parse(atob(localStorage.getItem("token").split('.')[1]));
    currentUserId.value = tokenPayload.id || tokenPayload._id;
    loadComments();
});

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const loadComments = async () => {
    loading.value = true;
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/spotify/playlist/${props.playlistId}/comments`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        comments.value = res.data || [];
    } catch (error) {
        console.error("Erreur lors du chargement des commentaires:", error);
    } finally {
        loading.value = false;
    }
};

const submitComment = async () => {
    if (!newComment.value.trim()) return;

    try {
        const res = await axios.post(
            `${BASE_URL}/api/spotify/playlist/${props.playlistId}/comment`,
            { text: newComment.value },
            {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }
        );

        comments.value = res.data;
        newComment.value = '';
    } catch (error) {
        console.error("Erreur lors de l'ajout du commentaire:", error);
    }
};

const startEditing = (comment) => {
    editingCommentId.value = comment._id;
    editedText.value = comment.text;
};

const cancelEdit = () => {
    editingCommentId.value = null;
    editedText.value = '';
};

const submitEdit = async (commentId) => {
    try {
        const res = await axios.put(
            `${BASE_URL}/api/spotify/playlist/${props.playlistId}/comment/${commentId}`,
            { text: editedText.value },
            {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }
        );
        comments.value = res.data;
        cancelEdit();
    } catch (error) {
        console.error("Erreur lors de la modification du commentaire:", error);
    }
};

const deleteComment = async (commentId) => {
    try {
        const res = await axios.delete(
            `${BASE_URL}/api/spotify/playlist/${props.playlistId}/comment/${commentId}`,
            {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }
        );
        comments.value = res.data;
    } catch (error) {
        console.error("Erreur lors de la suppression du commentaire:", error);
    }
};

const paginatedComments = computed(() => {
    const start = currentPage.value * commentsPerPage;
    return comments.value.slice(start, start + commentsPerPage);
});

const totalPages = computed(() => {
    return Math.ceil(comments.value.length / commentsPerPage);
});

function nextPage() {
    if (currentPage.value < totalPages.value - 1) {
        currentPage.value++;
    }
}

function prevPage() {
    if (currentPage.value > 0) {
        currentPage.value--;
    }
}
</script>

<style scoped>
.comments-area {
    margin-top: 10px;
    background: #f4f4f4;
    padding: 15px;
    border-radius: 8px;
    color: black;
}

.comments-list {
    list-style: none;
    padding: 0;
    margin-bottom: 10px;
    color: black;
}

.comment-item {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
}

.comment-text {
    display: block;
    max-height: 120px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    margin-top: 5px;
    color: black;
}

.comment-date {
    display: block;
    font-size: 0.8rem;
    color: #666;
    margin-top: 4px;
}

.comment-actions button {
    background: none;
    border: none;
    cursor: pointer;
    margin-right: 5px;
    font-size: 1.1rem;
}

.edit-input {
    width: 100%;
    padding: 5px;
    margin-top: 5px;
}

.comment-form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-top: 10px;
}

.comment-form input {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    box-sizing: border-box;
}

.comment-form button {
    align-self: flex-end;
    padding: 6px 12px;
    font-size: 1.2rem;
    cursor: pointer;
    background: none;
    border: none;
}

.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.pagination-controls button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
}
</style>
