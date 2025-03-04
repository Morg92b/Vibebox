const axios = require("axios");
const User = require("../models/user.model");
const Playlist = require("../models/playlist.model");

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
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ error: "ID utilisateur manquant" });
        }

        const user = await User.findById(userId);
        if (!user || !user.spotifyAccessToken) {
            return res.status(401).json({ error: "Utilisateur non connecté à Spotify" });
        }

        let allPlaylists = [];
        let nextUrl = "https://api.spotify.com/v1/me/playlists?limit=50";

        while (nextUrl) {
            const response = await axios.get(nextUrl, {
                headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
            });

            console.log("Réponse de l'API Spotify :", {
                status: response.status,
                data: {
                    total: response.data.total,
                    items: response.data.items.map(playlist => playlist.name),
                    next: response.data.next,
                },
            });

            allPlaylists = allPlaylists.concat(response.data.items);
            nextUrl = response.data.next;
        }

        res.json({
            total: allPlaylists.length,
            items: allPlaylists,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des playlists :", error.response?.data || error.message);

        if (error.response?.status === 401) {
            return res.status(401).json({ error: "Token Spotify expiré ou invalide" });
        }

        res.status(500).json({ error: "Impossible de récupérer les playlists" });
    }
};

module.exports.postUserPlaylist = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { playlistId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "ID utilisateur manquant" });
        }

        if (!playlistId) {
            return res.status(400).json({ error: "ID de la playlist manquant" });
        }

        const user = await User.findById(userId);
        if (!user || !user.spotifyAccessToken) {
            return res.status(401).json({ error: "Utilisateur non connecté à Spotify" });
        }

        // Récupération des infos de la playlist via Spotify
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
        });

        const playlistData = response.data;

        // Vérifier si la playlist est déjà enregistrée pour cet utilisateur
        let existingPlaylist = await Playlist.findOne({ spotifyId: playlistData.id, user: userId });

        if (existingPlaylist) {
            return res.status(400).json({ error: "Cette playlist est déjà enregistrée." });
        }

        // Création et sauvegarde de la playlist
        const newPlaylist = new Playlist({
            user: userId, 
            spotifyId: playlistData.id,
            name: playlistData.name,
            description: playlistData.description,
            imageUrl: playlistData.images?.[0]?.url || "",
            tracksCount: playlistData.tracks.total,
        });

        await newPlaylist.save();

        res.status(201).json({ message: "Playlist enregistrée avec succès", playlist: newPlaylist });

    } catch (error) {
        console.error("Erreur lors de l'enregistrement de la playlist :", error.response?.data || error.message);

        if (error.response?.status === 401) {
            return res.status(401).json({ error: "Token Spotify expiré ou invalide" });
        }

        res.status(500).json({ error: "Impossible d'enregistrer la playlist" });
    }
};
