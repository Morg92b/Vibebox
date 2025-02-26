const axios = require("axios");
const User = require("../models/user.model");

// Créer une playlist sur Spotify
module.exports.createPlaylist = async (req, res) => {
    const { userId, playlistName } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || !user.spotifyAccessToken) {
            return res.status(401).json({ error: "Compte Spotify non lié" });
        }

        const response = await axios.post(
            "https://api.spotify.com/v1/me/playlists",
            { name: playlistName, public: false },
            {
                headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
            }
        );

        return res.json({ message: "Playlist créée", playlist: response.data });
    } catch (error) {
        console.error("Erreur création playlist", error.response?.data || error.message);
        return res.status(500).json({ error: "Impossible de créer la playlist" });
    }
};

// Supprimer une playlist
module.exports.deletePlaylist = async (req, res) => {
    const { userId, playlistId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || !user.spotifyAccessToken) {
            return res.status(401).json({ error: "Compte Spotify non lié" });
        }

        await axios.delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
            headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
        });

        return res.json({ message: "Playlist supprimée" });
    } catch (error) {
        console.error("Erreur suppression playlist", error.response?.data || error.message);
        return res.status(500).json({ error: "Impossible de supprimer la playlist" });
    }
};

// Modifier une playlist (changer le nom ou la rendre publique/privée)
module.exports.updatePlaylist = async (req, res) => {
    const { userId, playlistId, newName, isPublic } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || !user.spotifyAccessToken) {
            return res.status(401).json({ error: "Compte Spotify non lié" });
        }

        await axios.put(
            `https://api.spotify.com/v1/playlists/${playlistId}`,
            { name: newName, public: isPublic },
            {
                headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
            }
        );

        return res.json({ message: "Playlist mise à jour" });
    } catch (error) {
        console.error("Erreur modification playlist", error.response?.data || error.message);
        return res.status(500).json({ error: "Impossible de modifier la playlist" });
    }
};


// Récupérer les playlists d'un utilisateur
module.exports.getUserPlaylists = async (req, res) => {
    const userId = req.user.id; // Récupérer l'ID de l'utilisateur connecté

    try {
        const user = await User.findById(userId);
        if (!user || !user.spotifyAccessToken) {
            return res.status(401).json({ error: "Utilisateur non connecté à Spotify" });
        }

        const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
            headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
        });

        res.json(response.data);
    } catch (error) {
        console.error("Erreur lors de la récupération des playlists :", error.response?.data || error.message);
        res.status(400).json({ error: "Impossible de récupérer les playlists" });
    }
};
