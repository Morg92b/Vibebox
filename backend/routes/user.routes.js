const express = require("express");
const { register, login, editUser, deleteUser } = require("../controllers/user.controller");
const authenticateUser = require("../middlewares/auth.middleware");
const router = express.Router();

// Routes ouvertes
router.post("/register", register);
router.post("/login", login);

// Routes sécurisées
router.put("/update/:id", authenticateUser, editUser);
router.delete("/:id", authenticateUser, deleteUser);

module.exports = router;

