const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
    {
        message : {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        likers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("post", postSchema);