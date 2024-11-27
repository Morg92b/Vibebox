const { deleteModel } = require("mongoose");
const PostModel = require("../models/post.model");
const postModel = require("../models/post.model");

module.exports.getPosts = async (req, res) => {
    const posts = await PostModel.find();
    res.status(200).json(posts)
};

module.exports.setPosts = async (req, res) => {
    if (!req.body.message) {
        res.status(400).json({ message: "Merci d'ajouter un message" });
    }

    const post = await PostModel.create({
        message: req.body.message,
        author: req.body.author,
    })
    res.status(200).json(post);
};

module.exports.editPost = async (req, res) => {
    try {
        // Vérifiez si le post existe
        const post = await PostModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Ce post n'existe pas" });
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

        await PostModel.findByIdAndDelete(req.params.id);

        res.status(200).json("Message supprimé " + post);
        
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la supression", error: error.message});
    }
};

module.exports.likePost = async (req, res) => {
    try {
        
        await PostModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { likers: req.body.userID } },
            {new: true}
        ).then((data) => res.status(200).send(data));
    } catch (error) {
        res.status(400).json(error)
    }
};

module.exports.dislikePost = async (req, res) => {
    try {
        
        await PostModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { likers: req.body.userID } },
            {new: true}
        ).then((data) => res.status(200).send(data));
    } catch (error) {
        res.status(400).json(error)
    }
};