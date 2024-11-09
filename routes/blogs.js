const express = require("express");
const router = express.Router();
const { blogs } = require("../controllers/blog.controller"); 

router.get("/blogs", blogs);

module.exports = router;
