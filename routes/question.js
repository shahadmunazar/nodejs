const express = require("express");
const router = express.Router();

const { checkRole } = require("../middleware/check-role");
const { checkAuth } = require("../middleware/check-auth");

const uploads = require("../middleware/uploads");

const { getQuestionsWithScores, SubmitAudio, getStudentdiscussion, get_swt_question, SubmitQuestion, getUserScoreSwt } = require("../controllers/question_all.controller");
const {
  GetSwtQuestion,
  GetStudnetScore,
  SubmitSwtAnswer,
  SubmitSWTBadges,
  SubmitSwtDiscussion,
  GetDiscussionSwt,
  DeleteSWtScore,
} = require("../controllers/WritingController/summarize.controller");
const { GetReorderQuestion } = require("../controllers/ReadingController/get_reorder.controller");
const { GetMSQAnswer, SubmitMSQScore, GetMSQStudentScore } = require("../controllers/ReadingController/multiple_single_answer.controller");
const { GetMTMAQuestions, SubmitMATQScore, GetMTMAStuentScore } = require("../controllers/ReadingController/multiple_type_multiple_answer.controller");
const { GetSwtPteCoreQuestion } = require("../controllers/WritingController/summarize_pte.controller");
const { GetEssayQuestion } = require("../controllers/WritingController/essay.controller");
const { GetEmailQuestion } = require("../controllers/WritingController/email_pte.controller");
const { route } = require("./crud");
const { checkExact } = require("express-validator");

router.get("/summarize-written-text", checkAuth, checkRole("user"), GetSwtQuestion);
router.get("/summarize-written-text-student-score", checkAuth, checkRole("user"), GetStudnetScore);
router.post("/summarize-written-text-submit-score", checkAuth, checkRole("user"), SubmitSwtAnswer);
router.post("/summarize-written-text-submit-badges", checkAuth, checkRole("user"), SubmitSWTBadges);
router.post("/summarize-written-text-submit-discussion", checkAuth, checkRole("user"), SubmitSwtDiscussion);
router.get("/summarize-written-text-get-student-discussion", checkAuth, checkRole("user"), GetDiscussionSwt);
router.delete("/summarize-written-text-delete-score", checkAuth, checkRole("user"), DeleteSWtScore);
router.get("/write-essay", checkAuth, checkRole("user"), GetEssayQuestion);
router.get("/write-email-pte-core", checkAuth, checkRole("user"), GetEmailQuestion);
router.get("/summarize-written-text-pte-core", checkAuth, checkRole("user"), GetSwtPteCoreQuestion);

router.get("/multiple-type-single-answer", checkAuth, checkRole("user"), GetMSQAnswer);
router.post("/multiple-type-single-answer-submit-score", checkAuth, checkRole("user"), SubmitMSQScore);
router.get("/multiple-type-single-answer-student-score", checkAuth, checkRole("user"), GetMSQStudentScore);

router.get("/multiple-type-multiple-answer-question", checkAuth, checkRole("user"), GetMTMAQuestions);
router.post("/multiple-type-multiple-answer-submit-score", checkAuth, checkRole("user"), SubmitMATQScore);
router.get("/multiple-type-multiple-answer-student-score", checkAuth, checkRole("user"), GetMTMAStuentScore);

router.get("/get-reorder-paragraph", checkAuth, checkRole("user"), GetReorderQuestion);

router.get("/question", checkAuth, checkRole("user"), getQuestionsWithScores);
// router.get("/summarize-written-text-student-score", checkAuth, checkRole("user"), getUserScoreSwt);
router.post("/question-answer-submit", checkAuth, checkRole("user"), SubmitQuestion);
router.get("/student-discussion", checkAuth, checkRole("user"), getStudentdiscussion);
router.post("/submit-answer-audio", checkAuth, checkRole("user"), uploads.single("audio_data"), SubmitAudio);

module.exports = router;
