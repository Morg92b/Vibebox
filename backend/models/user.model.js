const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true 
        },
        password: {
            type: String,
            required: true 
        },
        isEmailconfirmed: {
            type: Boolean,
            default: false,
        },
        spotifyAccessToken: {
            type: String,
            default: null,
        },
        spotifyRefreshToken: {
            type: String,
            default: null,
        },
        spotifyId: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Hacher le mot de passe avant de sauvegarder
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
