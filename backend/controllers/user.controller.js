const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer")
const { confirmEmail } = require("./email.controllers");
const blacklistModel = require("../models/blacklist.model");

module.exports.register = async (req, res) => {
    try {
        const {username, email, password, confirmpassword } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "E-mail invalide"});
        }

        if (password !== confirmpassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas"})
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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Email confirmation Spotibook !",
            html: `
                <h1>Bienvenue, ${username}!</h1>
                <p>Merci de votre inscription pour Spotibook. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
                <a href="${process.env.BASE_URL}/api/auth/confirm-email?token=${token}">Confirmation email</a>
            `,
        };

        await transporter.sendMail(mailOptions);

        console.log({ message: user })
        res.status(201).json({ message: "Utilisateur créé ! Veuillez vérifier votre adresse E-mail pour confirmer." });
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

        if (!user.isEmailconfirmed)
            return res.status(400).json({ message: "Veuillez confirmer votre adresse e-mail"})

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        console.log({ message: user });
        res.status(200).json({
            message: "Connexion réussie",
            token,
            userId: user._id,
            username: user.username,
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
    }
};

module.exports.editUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Vérification de l'user
        if (String(req.params.id) !== String(req.user._id)) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cet utilisateur" });
        }

        // Vérification de l'unicité du username
        if (username) {
            const existingUsername = await UserModel.findOne({ username });
            if (existingUsername && String(existingUsername._id) !== String(req.params.id)) {
                return res.status(400).json({ message: "Le nom d'utilisateur est déjà pris" });
            }
        }

        let emailChanged = false;

        // Vérification de l'unicité de l'email
        if (email) {
            const existingEmail = await UserModel.findOne({ email });
            if (existingEmail && String(existingEmail._id) !== String(req.params.id)) {
                return res.status(400).json({ message: "Cet email est déjà utilisé." });
            }

        const user = await UserModel.findById(req.params.id);
        if (user.email !== email) {
            emailChanged = true;
            }
        }
        // Spread operator
        const updatedFields = { ...req.body };

        // Chiffrement mdp avec salt
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedFields.password = await bcrypt.hash(password, salt);
        }

        if (emailChanged) {
            updatedFields.isEmailconfirmed = false;
        }

        // Mise à jour de l'utilisateur
        const updateUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            updatedFields,
            { new: true }
        );

        // Si l'utilisateur n'existe pas
        if (!updateUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Si l'User change d' e-mail
        if (emailChanged) {
            const token = jwt.sign({ userId: updateUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Confirmation de votre nouvel e-mail Spotibook",
                html: `
                    <h1>Bonjour, ${updateUser.username}!</h1>
                    <p>Vous avez modifié votre adresse e-mail. Veuillez confirmer votre nouvel e-mail en cliquant sur le lien ci-dessous :</p>
                    <a href="${process.env.BASE_URL}/api/auth/confirm-email?token=${token}">Confirmer mon nouvel email</a>
                `,
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({
                message: "Utilisateur mis à jour. Veuillez vérifier votre nouvel e-mail pour confirmer.",
            });
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

        const token = req.headers.authorization.split(" ")[1];

        await blacklistModel.create({ token });
        console.log(`Token dans la blacklist: ${token}`);

        await UserModel.findByIdAndDelete(userId);

        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
};

module.exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).json({ message: "Token manquant." });
        }

        await blacklistModel.create({ token });
        console.log(`Token dans la blacklist: ${token}`);

        res.status(200).json({ message: "Déconnexion reussie." });
    } catch (error) {
        res.status(500).json({ message: "Erreur déconnexion", error: error.message });
    }
};

module.exports.checkSpotifyLink = async (req, res) => {
    const userId = req.params.userId; // Récupérer l'ID passé dans l'URL

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        if (!user.spotifyAccessToken || !user.spotifyId) {
            return res.json({ linked: false, message: "Utilisateur non connecté à Spotify" });
        }

        return res.json({ linked: true, message: "Utilisateur connecté à Spotify", spotifyId: user.spotifyId });
    } catch (error) {
        console.error("Erreur lors de la vérification du lien Spotify :", error.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

module.exports.getUser = async (req, res) => {
    try {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({ error: "Le nom de l'utilisateur est requis" });
        }

        const user = await UserModel.findOne({ username: new RegExp(username, "i") });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        return res.json(user);
    } catch (error) {
        console.error("Erreur lors de la recherche de l'utilisateur :", error);
        return res.status(500).json({ error: "Erreur serveur." });
    }
};

module.exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID utilisateur invalide." });
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        return res.json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        return res.status(500).json({ error: "Erreur serveur." });
    }
};