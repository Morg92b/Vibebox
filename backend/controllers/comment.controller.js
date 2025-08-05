const playlistModel = require("../models/playlist.model");
const Playlist = require("../models/playlist.model");

module.exports.commentPlaylist = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: "Le commentaire est vide" });
        }

        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ message: "Playlist non trouvée" });
        }

        const comment = {
            user: req.user._id,
            text,
        };

        playlist.comments.push(comment);
        await playlist.save();

        const updated = await Playlist.findById(req.params.id)
            .populate("comments.user", "username");

        res.status(200).json(updated.comments);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du commentaire", error: error.message });
    }
};

module.exports.getCommentPlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;

    const Playlist = await playlistModel.findById(playlistId)
      .populate({
        path: 'comments.user',
        select: 'username'
      });

    if (!Playlist) {
      return res.status(404).json({ message: "Playlist non trouvée" });
    }

    res.json(Playlist.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des commentaires" });
  }
};

module.exports.editCommentPlaylist = async (req, res) => {
    try {
        const { text } = req.body;
        const playlistId = req.params.id;
        const commentId = req.params.commentId;

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist non trouvée" });

        const comment = playlist.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Commentaire non trouvé" });

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Non autorisé à modifier ce commentaire" });
        }

        comment.text = text;
        await playlist.save();

        const updated = await Playlist.findById(playlistId).populate("comments.user", "username");
        res.status(200).json(updated.comments);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la modification du commentaire", error: error.message });
    }
};

module.exports.deleteCommentPlaylist = async (req, res) => {
    try {
        const { id: playlistId, commentId } = req.params;

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist non trouvée" });

        const comment = playlist.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Commentaire non trouvé" });

        if (!comment.user || comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Non autorisé à supprimer ce commentaire" });
        }

        // suppression manuelle ( note: utiliser .remove que pour des sous-documents)
        playlist.comments = playlist.comments.filter(c => c._id.toString() !== commentId);
        await playlist.save();

        const updated = await Playlist.findById(playlistId).populate("comments.user", "username");
        res.status(200).json(updated.comments);
    } catch (error) {
        console.error("Erreur dans deleteCommentPlaylist:", error);
        res.status(500).json({ message: "Erreur lors de la suppression du commentaire", error: error.message });
    }
};


