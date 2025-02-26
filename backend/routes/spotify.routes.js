const express = require("express");
const { redirectToSpotify, handleSpotifyCallback, unlinkSpotifyAccount } = require("../config/spotify.config");

const router = express.Router();

router.get("/login", redirectToSpotify);
router.get("/callback", handleSpotifyCallback);
router.post("/unlink", unlinkSpotifyAccount);

module.exports = router;
