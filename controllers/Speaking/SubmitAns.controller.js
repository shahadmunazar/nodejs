const multer = require('multer');
const path = require('path');
const { Question, ZoneType, TblBadges, ScoreTbl, Answer, TblDiscussion, Sequelize } = require("../../models"); // Ensure this line imports correctly
const Validator = require('fastest-validator'); // Ensure fastest-validator is installed

const v = new Validator();

// Multer configuration for audio file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/practice'));
  },
  filename: function (req, file, cb) {
    cb(null, `audio_${Date.now()}_${file.originalname}`);
  },
});
console.log('storage',storage);
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  },
});

// Middleware for audio file upload
const uploadAudio = upload.single('audio_file');

/**
 * SubmitAnswer - Handles audio file and data submission
 */
async function SubmitAnswerS(req, res) {
  try {
    const schema = {
      ansData: { type: 'string', empty: false, messages: { required: 'Answer data is required.' } },
      questionID: { type: 'string', empty: true, positive: true, messages: { required: 'Question ID is required.' } },
      taskName: { type: 'string', empty: false, messages: { required: 'Task name is required.' } },
      time_taken: { type: 'string', empty: true, messages: { required: 'Time taken is optional.' } },
    };

    // Validate the request body
    const validationResponse = v.validate(req.body, schema);
    if (validationResponse !== true) {
      return res.status(400).json({ errors: validationResponse });
    }

    // Handle file upload
    uploadAudio(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to upload audio file', details: err.message });
      }

      const { ansData, questionID, taskName, time_taken } = req.body;
      const { userId } = req.userData;
      const audioFilePath = req.file ? req.file.path.replace('public', '') : null; // Store relative path

      const scoreStore = await ScoreTbl.create({
        question_id: questionID,
        task_id: taskName,
        student_id: userId,
        score: 0,
        total_score: 0,
        zone_id: 2,
        time_taken: time_taken || null,
        status: 1,
      });

      const storeAnswers = await Answer.create({
        question_id: questionID,
        task_name: taskName,
        student_id: userId,
        text_answer: ansData,
        audio_file: audioFilePath,
        created_at: new Date(),
        score_id: scoreStore.id,
      });

      res.status(201).json({
        message: 'Answer submitted successfully',
        data: {
          score: scoreStore,
          answer: storeAnswers,
        },
      });
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'An error occurred while submitting the answer.' });
  }
}

/**
 * SubmitSwtAnswer - Handles answer submission without audio
 */
async function SubmitSwtAnswer(req, res) {
  try {
    const schema = {
      ansData: { type: 'string', empty: false, messages: { required: 'Answer data is required.' } },
      questionID: { type: 'number', integer: true, positive: true, messages: { required: 'Question ID is required.' } },
      taskName: { type: 'number', empty: false, messages: { required: 'Task name is required.' } },
      time_taken: { type: 'string', empty: true, messages: { required: 'Time taken is optional.' } },
    };

    // Validate the request body
    const validationResponse = v.validate(req.body, schema);
    if (validationResponse !== true) {
      return res.status(400).json({ errors: validationResponse });
    }

    const { ansData, questionID, taskName, time_taken } = req.body;
    const { userId } = req.userData;

    const scoreStore = await ScoreTbl.create({
      question_id: questionID,
      task_id: taskName,
      student_id: userId,
      score: 0,
      total_score: 0,
      zone_id: 2,
      time_taken: time_taken || null,
      status: 1,
    });

    const storeAnswers = await Answer.create({
      question_id: questionID,
      task_name: taskName,
      student_id: userId,
      text_answer: ansData,
      created_at: new Date(),
      score_id: scoreStore.id,
    });

    res.status(201).json({
      message: 'Answer submitted successfully',
      data: {
        score: scoreStore,
        answer: storeAnswers,
      },
    });
  } catch (error) {
    console.error('Error submitting SWT answer:', error);
    res.status(500).json({ error: 'An error occurred while submitting the answer.' });
  }
}

module.exports = {
    SubmitAnswerS,
  SubmitSwtAnswer,
};
