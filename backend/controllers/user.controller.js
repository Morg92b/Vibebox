const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports.register = async (req, res) => {
    try {
        const {username, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailRegex.test(email)) {
            console.log("L'adresse email est valide !");
        } else {
            console.log("L'adresse email est invalide.");
        }

        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
        }

        const user = new UserModel({username, email, password });
        await user.save();
        res.status(201).json({ message: "Utilisateur créé !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription", error: error.message });
    }
};

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Mot de passe incorrect." });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Connexion réussie", token });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
    }
};

module.exports.editUser = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (String(req.params.id) !== String(req.user._id)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cet utilisateur" });
        }

        // Vérification de l'unicité du username
        if (username) {
            const existingUsername = await UserModel.findOne({ username });
            if (existingUsername && existingUsername._id !== req.params.id) {
                return res.status(400).json({ message: "Le nom d'utilisateur est déjà pris" });
            }
        }

        // Vérification de l'unicité de l'email
        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail && existingEmail._id !== req.params.id) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // Mise à jour de l'utilisateur
        const updateUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        // Si l'utilisateur n'existe pas
        if (!updateUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Retourne l'utilisateur mis à jour
        res.status(200).json(updateUser);
    } catch (error) {
        res.status(400).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};

module.exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        if (String(userId) !== String(req.user._id)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cet utilisateur" });
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        await UserModel.findByIdAndDelete(userId);

        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
};
