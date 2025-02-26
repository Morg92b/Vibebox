const express = require("express");
const { createPlaylist, deletePlaylist, updatePlaylist, getUserPlaylists } = require("../controllers/playlist.controller");
const authenticateUser = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/create", authenticateUser, createPlaylist);
router.delete("/delete", authenticateUser, deletePlaylist);
router.put("/update", authenticateUser, updatePlaylist);
router.get("/", authenticateUser, getUserPlaylists);

module.exports = router;
