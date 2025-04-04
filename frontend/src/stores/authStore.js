import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem("user")) || null,
        token: localStorage.getItem("token") || null,
        spotifyAccessToken: localStorage.getItem("spotifyAccessToken") || null,
        savedPlaylists: JSON.parse(localStorage.getItem("savedPlaylists")) || [],
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        username: (state) => state.user?.username || null,
        userId: (state) => state.user?._id || null,
    },
    actions: {
        login(username, token, userId) {
            this.user = { username, _id: userId };
            this.token = token;
        
            localStorage.setItem("user", JSON.stringify(this.user));
            localStorage.setItem("token", token);
    
            const storedPlaylists = JSON.parse(localStorage.getItem("savedPlaylists")) || [];
            this.savedPlaylists = storedPlaylists;
            console.log("Playlists restaurées après connexion :", this.savedPlaylists);
        },
        logout() {
            this.user = null;
            this.token = null;
            this.spotifyAccessToken = null;
        
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("spotifyAccessToken");
        
            console.log("Déconnexion effectuée, playlists sauvegardées préservées :", localStorage.getItem("savedPlaylists"));
        },        
        setSpotifyToken(token) {
            this.spotifyAccessToken = token;
            localStorage.setItem("spotifyAccessToken", token);
        },
        addPlaylist(playlistId) {
            if (!this.savedPlaylists.some(p => p.id === playlistId)) {
                this.savedPlaylists.push({ id: playlistId });
                localStorage.setItem("savedPlaylists", JSON.stringify(this.savedPlaylists));
            }
        },
        removePlaylist(playlistId) {
            this.savedPlaylists = this.savedPlaylists.filter(p => p.id !== playlistId);
            localStorage.setItem("savedPlaylists", JSON.stringify(this.savedPlaylists));
        },
        initialize() {
            if (this.token) {
                try {
                    const payload = JSON.parse(atob(this.token.split(".")[1]));
                    if (payload.exp * 1000 < Date.now()) {
                        this.logout();
                    }
                } catch (e) {
                    console.error("Erreur de décodage du token", e);
                    this.logout();
                }
            }
        },
        refresh() {
            this.initialize();
            if (!this.token) {
                this.logout();
            }
        },
    },
});
