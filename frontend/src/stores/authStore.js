import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        username: (state) => state.user?.username || null,
        userId: (state) => state.user?._id || null
    },
    actions: {
        login(username, token, userId) {
            this.user = { 
                username,
                _id: userId 
            };
            this.token = token;
            
            localStorage.setItem('user', JSON.stringify(this.user));
            localStorage.setItem('token', token);
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
        initialize() {
            if (this.token) {
                try {
                    const payload = JSON.parse(atob(this.token.split('.')[1]));
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
        }
    }
});