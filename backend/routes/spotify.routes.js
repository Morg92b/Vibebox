const express = require("express");
const { redirectToSpotify, handleSpotifyCallback, unlinkSpotifyAccount, refreshSpotifyToken } = require("../config/spotify.config");

const router = express.Router();

router.get("/login", redirectToSpotify);
router.get("/callback", handleSpotifyCallback);
router.post("/unlink", unlinkSpotifyAccount);
router.post("/refreshtoken", refreshSpotifyToken);

module.exports = router;
