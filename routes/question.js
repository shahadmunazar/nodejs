// Import necessary modules
const express = require("express");
const router = express.Router();

// Import middleware functions
const { checkRole } = require("../middleware/check-role");
const { checkAuth } = require("../middleware/check-auth");

// Import controller functions
const { getQuestionsWithScores, get_swt_question, SubmitQuestion } = require("../controllers/question_all.controller");

// Define routes

router.get("/question", checkAuth, checkRole("user"), getQuestionsWithScores);
router.post("/question-answer-submit", checkAuth, checkRole("user"), SubmitQuestion);

module.exports = router;
