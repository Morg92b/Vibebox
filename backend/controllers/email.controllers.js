const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

module.exports.confirmEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Missing Token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Mise à jour de l'utilisateur pour confirmer l'email
        user.isEmailconfirmed = true;

        // Sauvegarde du document utilisateur
        const updatedUser = await user.save();

        console.log("User updated :", updatedUser);  // Ajoutez un log pour vérifier le retour

        return res.status(200).json({ message: 'Email confirmed successfully' });
    } catch (error) {
        console.error("Error confirming email :", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};