const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", false); // Active ou désactive strictQuery si nécessaire
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo connecté :)");
    } catch (err) {
        console.error("Erreur lors de la connexion à MongoDB :", err);
        process.exit(1); // Arrête l'application en cas d'erreur critique
    }
};

module.exports = connectDB;
