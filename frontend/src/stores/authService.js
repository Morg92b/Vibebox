import axios from 'axios';
import { useAuthStore } from './authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5500";

export const login = async (credentials, authStore, router) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, credentials);
        console.log('Réponse de l\'API de connexion :', response.data);
        
        if (response.data.token && response.data.username && response.data.userId) {
            authStore.login(
                response.data.username, 
                response.data.token, 
                response.data.userId
            );
            
            // Initialiser immédiatement après le login
            authStore.initialize();
            
            router.push('/Vibe');
            return response.data;
        } else {
            throw new Error("Données de connexion incomplètes");
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
    }
};

export const logout = async (authStore, router) => {
    try {
        const token = authStore.token;
        if (!token) {
            throw new Error("Token is missing.");
        }
        await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        authStore.logout();
        router.push('/login');
    } catch (error) {
        console.error("Erreur lors de la déconnexion : ", error);
        throw error;
    }
};

export const register = async (credentials) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, credentials);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "Une erreur est survenue. Veuillez réessayer");
        } else {
            throw new Error("Une erreur est survenue. Veuillez réessayer");
        }
    }
};

export const updateUserProfile = async (userData) => {
    const authStore = useAuthStore();
    authStore.checkTokenExpiration();
    const token = authStore.token;
    const userId = authStore.userId;

    if (!userId || !token) {
        throw new Error("User ID ou Token manquant.");
    }

    const updateData = { ...userData };
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || null) {
            delete updateData[key];
        }
    });

    try {
        const responseUpdate = await axios.put(`${BASE_URL}/api/auth/update/${userId}`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(responseUpdate.data); // Pour vérifier la réponse

        if (responseUpdate.data.logout) {
            authStore.logout();
            alert('Votre profil a été mis à jour. Vous êtes maintenant déconnecté.');
            console.log('Déconnexion effectuée.');
            router.push('/login'); // Rediriger vers la page de connexion
        } else {
            alert('Profil mis à jour avec succès.');
        }

        return responseUpdate.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "Une erreur est survenue. Veuillez réessayer");
        } else {
            throw new Error("Une erreur est survenue. Veuillez réessayer");
        }
    }
};

export const refreshSpotifyToken = async () => {
    const authStore = useAuthStore();
    const userId = authStore.userId;
    const refreshToken = authStore.spotifyRefreshToken; // Utilise le refresh token

    if (!userId || !refreshToken) {
        throw new Error("L'ID de l'utilisateur et le refresh token sont requis.");
    }

    try {
        const response = await axios.post(`${BASE_URL}/api/spotify/refreshtoken`, {
            userId,
            refresh_token: refreshToken, // Passe le refresh token
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authStore.token}`,
            },
        });

        if (response.data.access_token) {
            authStore.setSpotifyToken(response.data.access_token, refreshToken); // Met à jour
            console.log("Nouveau token Spotify récupéré :", response.data.access_token);
        } else {
            throw new Error("Aucun token reçu.");
        }
    } catch (error) {
        console.error("Erreur lors du rafraîchissement du token:", error.response?.data || error.message);
        throw error;
    }
};

