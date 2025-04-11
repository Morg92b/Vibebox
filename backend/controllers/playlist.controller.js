const axios = require("axios");
const User = require("../models/user.model");
const Playlist = require("../models/playlist.model");
const mongoose = require("mongoose");

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

module.exports.deletePlaylist = async (req, res) => {
    const { userId, playlistId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: "Utilisateur non trouvé" });
        }
        const deletedPlaylist = await Playlist.findOneAndDelete({ user: userId, spotifyId: playlistId });

        if (!deletedPlaylist) {
            return res.status(404).json({ error: "Playlist non trouvée sur le site" });
        }

        return res.json({ message: "Playlist supprimée du site" });
    } catch (error) {
        console.error("Erreur suppression playlist du site", error.message);
        return res.status(500).json({ error: "Impossible de supprimer la playlist du site" });
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

            console.log("Playlists récupérées :", response.data.items.map(p => ({
                id: p.id,
                name: p.name
            })));

            allPlaylists = allPlaylists.concat(response.data.items.map(playlist => ({
                id: playlist.id,
                name: playlist.name,
            })));

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

module.exports.likePlaylist = async (req, res) => {
    try {
        const { userId, playlistId } = req.body;

        // Vérification des IDs
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "ID utilisateur invalide." });
        }
        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            return res.status(400).json({ error: "ID playlist invalide." });
        }

        // Vérification de l'existence
        const [user, playlist] = await Promise.all([
            User.findById(userId),
            Playlist.findById(playlistId)
        ]);

        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
        if (!playlist) return res.status(404).json({ error: "Playlist non trouvée" });

        // Conversion des IDs en string pour la comparaison
        const userIdStr = userId.toString();
        const likesStr = playlist.likes.map(id => id.toString());

        if (likesStr.includes(userIdStr)) {
            return res.status(400).json({ error: "Vous avez déjà liké cette playlist" });
        }

        playlist.likes.push(userId);
        await playlist.save();

        res.status(200).json({ 
            message: "Playlist likée avec succès",
            likes: playlist.likes
        });
    } catch (error) {
        console.error("Erreur lors du like de la playlist :", error.message);
        res.status(500).json({ error: "Impossible de liker la playlist" });
    }
};

module.exports.unlikePlaylist = async (req, res) => {
    try {
        const { userId, playlistId } = req.body;

        // Vérification des IDs
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "ID utilisateur invalide." });
        }
        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            return res.status(400).json({ error: "ID playlist invalide." });
        }

        const [user, playlist] = await Promise.all([
            User.findById(userId),
            Playlist.findById(playlistId)
        ]);

        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
        if (!playlist) return res.status(404).json({ error: "Playlist non trouvée" });

        // Conversion des IDs en string pour la comparaison
        const userIdStr = userId.toString();
        const likesStr = playlist.likes.map(id => id.toString());

        if (!likesStr.includes(userIdStr)) {
            return res.status(400).json({ error: "Vous n'avez pas liké cette playlist" });
        }

        playlist.likes = playlist.likes.filter(id => id.toString() !== userIdStr);
        await playlist.save();

        res.status(200).json({ 
            message: "Like retiré avec succès",
            likes: playlist.likes // Retourne le nouveau tableau de likes
        });
    } catch (error) {
        console.error("Erreur lors du retrait du like :", error.message);
        res.status(500).json({ error: "Impossible de retirer le like" });
    }
};

module.exports.getAllPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find().sort({ createdAt: -1 }).populate('user', 'username');

        res.status(200).json(playlists);
    } catch (error) {
        console.error("Erreur lors de la récupération des playlists :", error.message);
        res.status(500).json({ error: "Impossible de récupérer les playlists" });
    }
};

module.exports.getPlaylistsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "ID utilisateur invalide." });
        }

        const playlists = await Playlist.find({ user: userId }).sort({ createdAt: -1 });

        if (!playlists.length) {
            return res.status(404).json({ error: "Aucune playlist trouvée pour cet utilisateur." });
        }

        res.status(200).json(playlists);
    } catch (error) {
        console.error("Erreur lors de la récupération des playlists de l'utilisateur :", error.message);
        res.status(500).json({ error: "Impossible de récupérer les playlists de cet utilisateur." });
    }
};
