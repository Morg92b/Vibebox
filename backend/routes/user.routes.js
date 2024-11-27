const express = require("express");
const { set } = require("mongoose");
const { register, login, editUser, deleteUser } = require("../controllers/user.controller");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/update/:id", editUser);
router.delete("/:id", deleteUser);

module.exports = router;
