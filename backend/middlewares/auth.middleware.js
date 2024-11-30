const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Authentification requise." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        req.user = user; // Attache l'utilisateur à la requête
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide." });
    }
};

module.exports = authenticateUser;
