const mongoose = require("mongoose");

const PlaylistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    spotifyId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String
    },
    tracksCount: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model("Playlist", PlaylistSchema);