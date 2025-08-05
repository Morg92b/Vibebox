const express = require("express");
const { createPlaylist, deletePlaylist, updatePlaylist, getUserPlaylists, postUserPlaylist, likePlaylist, unlikePlaylist, getAllPlaylists, getPlaylistsByUser } = require("../controllers/playlist.controller");
const authenticateUser = require("../middlewares/auth.middleware");
const { commentPlaylist, getCommentPlaylist, editCommentPlaylist, deleteCommentPlaylist } = require("../controllers/comment.controller");

const router = express.Router();

router.post("/create", authenticateUser, createPlaylist);
router.delete("/delete", authenticateUser, deletePlaylist);
router.put("/update", authenticateUser, updatePlaylist);
router.get("/", authenticateUser, getUserPlaylists);
router.post("/post", authenticateUser, postUserPlaylist);
router.patch("/like-playlist", authenticateUser, likePlaylist);
router.patch("/unlike", authenticateUser, unlikePlaylist);
router.post("/:id/comment", authenticateUser, commentPlaylist);
router.get("/:id/comments", authenticateUser, getCommentPlaylist);
router.put("/:id/comment/:commentId", authenticateUser, editCommentPlaylist);
router.delete("/:id/comment/:commentId", authenticateUser, deleteCommentPlaylist);
router.get("/getAllPlaylist", getAllPlaylists);
router.get("/user/:userId", getPlaylistsByUser);

module.exports = router;
