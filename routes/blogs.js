const express = require("express");
const router = express.Router();
const { blogs } = require("../controllers/blog.controller"); // Adjust the path based on your folder structure

// Define the route handler for the index route
router.get("/blogs", blogs);

module.exports = router;
