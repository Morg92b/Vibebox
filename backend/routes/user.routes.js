const express = require("express");
const { register, login, editUser, deleteUser, logout } = require("../controllers/user.controller");
const authenticateUser = require("../middlewares/auth.middleware");
const { confirmEmail } = require("../controllers/email.controllers");
const router = express.Router();

// Routes ouvertes
router.post("/register", register);
router.post("/login", login);
router.get("/confirm-email", confirmEmail)

// Routes sécurisées
router.put("/update/:id", authenticateUser, editUser);
router.delete("/:id", authenticateUser, deleteUser);
router.post("/logout", authenticateUser, logout);

module.exports = router;
