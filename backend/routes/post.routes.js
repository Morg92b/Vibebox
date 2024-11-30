const express = require("express");
const { setPosts, getPosts, editPost, deletePost, likePost, dislikePost } = require("../controllers/post.controller");
const authenticateUser = require("../middlewares/auth.middleware");
const router = express.Router();

// Routes
router.get("/", getPosts); 
router.post("/", authenticateUser, setPosts); 
router.put("/:id", authenticateUser, editPost); 
router.delete("/:id", authenticateUser, deletePost); 
router.patch("/like-post/:id", authenticateUser, likePost); 
router.patch("/dislike-post/:id", authenticateUser, dislikePost);

module.exports = router;
