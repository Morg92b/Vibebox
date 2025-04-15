const axios = require("axios");
const mongoose = require("mongoose");
const UserModel = require("../models/user.model");

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

module.exports.redirectToSpotify = (req, res) => {
    const scope = "user-read-private user-read-email playlist-read-private playlist-read-collaborative";
    const userId = req.query.userId; // ID de l'utilisateur passé en query parameter
    const authorizationUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&state=${userId}`;
    res.json({ url: authorizationUrl });
};

// Fonction pour unir les deux comptes
module.exports.handleSpotifyCallback = async (req, res) => {
    const code = req.query.code;
    const userId = req.query.state;

    try {
        // Demander un token d'accès auprès de Spotify
        const tokenResponse = await axios.post("https://accounts.spotify.com/api/token", null, {
            params: {
                grant_type: "authorization_code",
                code: code,
                redirect_uri: SPOTIFY_REDIRECT_URI,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET,
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const { access_token, refresh_token } = tokenResponse.data;

        // Obtenir le profil utilisateur Spotify
        const userProfileResponse = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const spotifyId = userProfileResponse.data.id;

        // Mettre à jour l'utilisateur dans la BDD
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        user.spotifyAccessToken = access_token;
        user.spotifyRefreshToken = refresh_token;
        user.spotifyId = spotifyId;
        await user.save();

        console.log("Spotify Access Token:", access_token);
        console.log("Spotify Refresh Token:", refresh_token);

        return res.redirect(`https://vibebox-one.vercel.app/Vibe`);

    } catch (error) {
        console.error("Erreur lors de l'authentification Spotify", error.response?.data || error.message);
        return res.status(500).json({ error: "Impossible d'obtenir le token Spotify" });
    }
};


// Fonction pour désunir les deux comptes
module.exports.unlinkSpotifyAccount = async (req, res) => {
    const userId = req.body.userId;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        user.spotifyAccessToken = null;
        user.spotifyRefreshToken = null;
        user.spotifyId = null;
        await user.save();

        return res.json({ message: "Compte Spotify déconnecté avec succès !" });
    } catch (error) {
        console.error("Erreur lors de la déconnexion du compte Spotify :", error.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

module.exports.refreshSpotifyToken = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "L'ID de l'utilisateur est requis" });
    }

    try {
        const user = await UserModel.findById(userId);
        if (!user || !user.spotifyRefreshToken) {
            return res.status(404).json({ error: "Utilisateur non trouvé ou refresh token manquant" });
        }

        const tokenResponse = await axios.post("https://accounts.spotify.com/api/token", null, {
            params: {
                grant_type: "refresh_token",
                refresh_token: user.spotifyRefreshToken,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET,
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const { access_token } = tokenResponse.data;

        // Mettre à jour le token d'accès dans la base de données
        user.spotifyAccessToken = access_token;
        await user.save();

        return res.json({ access_token });
    } catch (error) {
        console.error("Erreur lors du rafraîchissement du token Spotify", error.response?.data || error.message);
        return res.status(500).json({ error: "Erreur lors du rafraîchissement du token Spotify" });
    }
};
