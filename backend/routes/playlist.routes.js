const express = require("express");
const { createPlaylist, deletePlaylist, updatePlaylist, getUserPlaylists, postUserPlaylist, likePlaylist, unlikePlaylist, getAllPlaylists } = require("../controllers/playlist.controller");
const authenticateUser = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/create", authenticateUser, createPlaylist);
router.delete("/delete", authenticateUser, deletePlaylist);
router.put("/update", authenticateUser, updatePlaylist);
router.get("/", authenticateUser, getUserPlaylists);
router.post("/post", authenticateUser, postUserPlaylist);
router.patch("/like-playlist", authenticateUser, likePlaylist);
router.patch("/unlike", authenticateUser, unlikePlaylist);
router.get("/getAllPlaylist", getAllPlaylists);

module.exports = router;
