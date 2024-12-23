const express = require("express");
const router = express.Router();

const { checkRole } = require("../middleware/check-role");
const { checkAuth } = require("../middleware/check-auth");

const upload = require('../middleware/uploads');  // Assuming you have a middleware for file upload

const {SubmitAnswerS} = require("../controllers/Speaking/SubmitAns.controller");

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
const { GetReorderQuestion, SubmitReorderAnswer,GetReorderScore } = require("../controllers/ReadingController/get_reorder.controller");
const { GetMSQAnswer, SubmitMSQScore, GetMSQStudentScore } = require("../controllers/ReadingController/multiple_single_answer.controller");
const { GetMTMAQuestions, SubmitMATQScore, GetMTMAStuentScore } = require("../controllers/ReadingController/multiple_type_multiple_answer.controller");
const { GetSwtPteCoreQuestion } = require("../controllers/WritingController/summarize_pte.controller");
const { GetEssayQuestion } = require("../controllers/WritingController/essay.controller");
const { GetEmailQuestion } = require("../controllers/WritingController/email_pte.controller");
const { GetReadAloud, CheckStudentScore, SubmitAnswer } = require("../controllers/Speaking/read_aloud.controller");
const { GetRepeatSentences, GetRepeatSentenceScore } = require("../controllers/Speaking/repeat_sentences.controller");
const { GetDescribeImageQuestion, GetDIStudentScore } = require("../controllers/Speaking/describe_image.controller");
const { GetRetellLectureQuestion } = require("../controllers/Speaking/retell_lecture.controller");
const { GetRTSGetQuestion } = require("../controllers/Speaking/respond_to_situation.controller");
const { GetAnswerShortQuestions } = require("../controllers/Speaking/AnswerShortQuestion.controller");
const {GetReadingFillIntheBlankQuestion,SubmitReadFillBlankAnswer,GetReadingFillIntheBlank} = require("../controllers/ReadingController/reading_fill_in_the_blank.controller");
const {ReadWriteFillinTheBlank,SubmitReadWrireBlank,CheckReadWriteStudentScore} = require("../controllers/ReadingController/read_write_fill_in_the_blank.controller");
const {ListeningMCQ} = require('../controllers/ListeningController/mcqsalistening.controller');
const {SummarizeSpokenText} = require("../controllers/ListeningController/summarizeSpokenText.controller");

const {SummarizeSpokenTextPtecore} = require("../controllers/ListeningController/summarizeSpokenTextPteCore.controller");

/**
 * Middleware wrapper to apply checkAuth and checkRole globally to routes.
 * @param {Function} handler - The route handler function.
 * @param {string} role - Role to check for access.
 * @returns {Function} - Middleware with checkAuth, checkRole, and the handler.
 */
const withAuthAndRole = (handler, role = "user") => [checkAuth, checkRole(role), handler];
router.get("/summarize-written-text", ...withAuthAndRole(GetSwtQuestion));
router.get("/summarize-written-text-student-score", ...withAuthAndRole(GetStudnetScore));
router.post("/summarize-written-text-submit-score", ...withAuthAndRole(SubmitSwtAnswer));
router.post("/summarize-written-text-submit-badges", ...withAuthAndRole(SubmitSWTBadges));
router.post("/summarize-written-text-submit-discussion", ...withAuthAndRole(SubmitSwtDiscussion));
router.get("/summarize-written-text-get-student-discussion", ...withAuthAndRole(GetDiscussionSwt));
router.delete("/summarize-written-text-delete-score", ...withAuthAndRole(DeleteSWtScore));
router.get("/write-essay", ...withAuthAndRole(GetEssayQuestion));
router.get("/write-email-pte-core", ...withAuthAndRole(GetEmailQuestion));
router.get("/summarize-written-text-pte-core", ...withAuthAndRole(GetSwtPteCoreQuestion));
router.get("/read-aloud-questions", ...withAuthAndRole(GetReadAloud));
router.get("/read-aloud-student-score", ...withAuthAndRole(CheckStudentScore));

// Routes for Repeat Sentences
router.get("/repeat-sentences-question", ...withAuthAndRole(GetRepeatSentences));
router.get("/repeat-sentences-student-score", ...withAuthAndRole(GetRepeatSentenceScore));

// Routes for Describe Image
router.get("/describe-image-questions", ...withAuthAndRole(GetDescribeImageQuestion));
router.get("/describe-image-get-student-score", ...withAuthAndRole(GetDIStudentScore));

// Routes for Retell Lecture
router.get("/retell-lecture-get-question", ...withAuthAndRole(GetRetellLectureQuestion));

// Routes for Respond to Situation
router.get("/respond-to-situation-get-question", ...withAuthAndRole(GetRTSGetQuestion));

// Routes for Answer Short Question
router.get("/answer-short-question-get", ...withAuthAndRole(GetAnswerShortQuestions));
router.get("/multiple-type-single-answer", ...withAuthAndRole(GetMSQAnswer));
router.post("/multiple-type-single-answer-submit-score", ...withAuthAndRole(SubmitMSQScore));
router.get("/multiple-type-single-answer-student-score", ...withAuthAndRole(GetMSQStudentScore));


router.get("/multiple-type-multiple-answer-question", ...withAuthAndRole(GetMTMAQuestions));
router.post("/multiple-type-multiple-answer-submit-score", ...withAuthAndRole(SubmitMATQScore));
router.get("/multiple-type-multiple-answer-student-score", ...withAuthAndRole(GetMTMAStuentScore));

router.get("/get-reorder-paragraph", ...withAuthAndRole(GetReorderQuestion));
router.post("/submit-reorder-answer", ...withAuthAndRole(SubmitReorderAnswer));
router.get("/reorder-paragraph-student-score", ...withAuthAndRole(GetReorderScore));

router.get("/reading-fill-in-the-blank",...withAuthAndRole(GetReadingFillIntheBlankQuestion));
router.post('/submit-reading-fill-in-the-blank-answer',...withAuthAndRole(SubmitReadFillBlankAnswer));
router.get("/get-reading-fill-in-the-blank-score", ...withAuthAndRole(GetReadingFillIntheBlank));

router.get("/read-write-fill-in-the-blank-question",...withAuthAndRole(ReadWriteFillinTheBlank));
router.post('/read-write-submit-answer',...withAuthAndRole(SubmitReadWrireBlank));
router.get('/read-write-get-student-score', ...withAuthAndRole(CheckReadWriteStudentScore));


//Listening Routes Start
router.get('/summarize-spoken-text', ...withAuthAndRole(SummarizeSpokenText));

router.get('/summarize-spoken-text-pte-score', ...withAuthAndRole(SummarizeSpokenTextPtecore));
router.get('listening-multiple-question', ...withAuthAndRole(ListeningMCQ));


router.get("/question", ...withAuthAndRole(getQuestionsWithScores));
router.post("/question-answer-submit", ...withAuthAndRole(SubmitQuestion));
router.get("/student-discussion", ...withAuthAndRole(getStudentdiscussion));

// router.post("/submit-answer", ...withAuthAndRole(SubmitAnswer));

// console.log('upload', uploads.single('audio_file'));


router.post('/submit-answer',upload.single('audio_file'),  ...withAuthAndRole(SubmitAnswerS));


// router.post("/submit-answer-audio", checkAuth, checkRole("user"), uploads.single("audio_data"), SubmitAudio);

module.exports = router;
