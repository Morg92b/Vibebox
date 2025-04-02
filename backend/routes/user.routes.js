const express = require("express");
const { register, login, editUser, deleteUser, logout, checkSpotifyLink, getUser, getUserById, getUsersByIds } = require("../controllers/user.controller");
const authenticateUser = require("../middlewares/auth.middleware");
const { confirmEmail } = require("../controllers/email.controllers");
const router = express.Router();

// Routes ouvertes
router.post("/register", register);
router.post("/login", login);
router.get("/confirm-email", confirmEmail);
router.get("/searchuser", getUser);
router.get("/getuser/:id", getUserById);

// Routes sécurisées
router.put("/update/:id", authenticateUser, editUser);
router.delete("/:id", authenticateUser, deleteUser);
router.post("/logout", authenticateUser, logout);
router.get("/:userId/spotify", authenticateUser, checkSpotifyLink);
router.post('/getUsersByIds', getUsersByIds);

module.exports = router;
