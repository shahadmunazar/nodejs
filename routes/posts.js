// routes/posts.routes.js

const express = require("express");
const router = express.Router();
const { save, update, destroy, show, index } = require("../controllers/posts.controller");
const { checkAuth } = require("../middleware/check-auth");
const { checkRole } = require("../middleware/check-role");

router.post("/", checkAuth, checkRole("user"), save);

router.get("/:id", checkAuth, checkRole("user"), show);

router.get("/", checkAuth, checkRole("subadmin"), index);

router.put("/:id", checkAuth, checkRole("superadmin"), update);

router.delete("/:id", checkAuth, checkRole("admin"), destroy);

module.exports = router;
