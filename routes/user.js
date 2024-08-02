const express = require("express");

const userController = require("../controllers/user.controller");
const { Model } = require("sequelize");
const router = express.Router();

router.post("/sign-up", userController.signup);
router.put("/verify-user", userController.verify_user);
router.post("/login", userController.login);
module.exports = router;
