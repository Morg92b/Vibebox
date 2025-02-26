const axios = require("axios");
const mongoose = require("mongoose");
const UserModel = require("../models/user.model");

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

module.exports.redirectToSpotify = (req, res) => {
    const scope = "user-read-private user-read-email";
    const userId = req.query.userId; // ID de l'utilisateur passé en query parameter
    const authorizationUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(scope)}&state=${userId}`;
    res.redirect(authorizationUrl);
};

// Function pour unir les deux comptes
module.exports.handleSpotifyCallback = async (req, res) => {
    const code = req.query.code;
    const userId = req.query.state;

    try {
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

        // Obtenir l'ID de l'utilisateur Spotify
        const userProfileResponse = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const spotifyId = userProfileResponse.data.id;

        // Mettre à jour l'utilisateur dans la BDD
        const user = await UserModel.findById(new mongoose.Types.ObjectId(userId));
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        user.spotifyAccessToken = access_token;
        user.spotifyRefreshToken = refresh_token;
        user.spotifyId = spotifyId;
        await user.save();

        return res.json({ message: "Compte Spotify lié avec succès !" });
    } catch (error) {
        console.error("Erreur lors de l'authentification Spotify", error.response?.data || error.message);
        return res.status(500).json({ error: "Impossible d'obtenir le token Spotify" });
    }
};

// Fonction pour désunir les deux comptes
module.exports.unlinkSpotifyAccount = async (req, res) => {
    const userId = req.body.userId;

    try {
        const user = await UserModel.findById(new mongoose.Types.ObjectId(userId));
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Supprimer les tokens et l'ID Spotify
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
