const { deleteModel } = require("mongoose");
const PostModel = require("../models/post.model");

module.exports.getPosts = async (req, res) => {
    try {
        const posts = await PostModel.find()
            .populate("author", "username email") 
            .populate("likers", "username");
        res.status(200).json(posts);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la récupération des posts", error: error.message });
    }
};


module.exports.setPosts = async (req, res) => {
    try {
        if (!req.body.message) {
            res.status(400).json({ message: "Merci d'ajouter un message" });
        }
        
        const post = await PostModel.create({
            message: req.body.message,
            author: req.user._id,
        });
        res.status(200).json(post);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la création", error: error.message });
        }
    };

module.exports.editPost = async (req, res) => {
    try {
        // Vérifiez si le post existe
        const post = await PostModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Ce post n'existe pas" });
        }
        
        if (String(post.author) !== String(req.user._id)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce message" });
        }

        // Mettre à jour le post
        const updatePost = await PostModel.findByIdAndUpdate(
            req.params.id, // Passez directement l'ID ici
            req.body,
            { new: true }
        );

        res.status(200).json(updatePost);
    } catch (error) {
        // Gérez les erreurs (ex: ID invalide)
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};

module.exports.deletePost = async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Ce post n'existe pas"});
        }

        if (String(post.author) !== String(req.user._id)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce message" });
        }

        await PostModel.findByIdAndDelete(req.params.id);

        res.status(200).json("Message supprimé " + post);
        
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la supression", error: error.message});
    }
};

module.exports.likePost = async (req, res) => {
    try {
        const post = await PostModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { likers: req.user._id } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: "Post non trouvé" });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors du like", error: error.message });
    }
};

module.exports.dislikePost = async (req, res) => {
    try {
        const post = await PostModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { likers: req.user._id } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: "Post non trouvé" });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors du dislike", error: error.message });
    }
};
