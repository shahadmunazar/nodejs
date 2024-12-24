const { Question, ScoreTbl, Answer } = require('../../models');
const Validator = require('fastest-validator');
const upload = require('../../middleware/uploads');

const v = new Validator();

/**
 * SubmitAnswer - Handles audio file and data submission
 */
async function SubmitAnswerS(req, res) {
  try {
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }
    const audioFilePath = req.file.path.replace('public', '');
    console.log('Audio File Path:', audioFilePath);
    const schema = {
      ansData: { type: 'string', empty: false },
      questionID: { type: 'string', empty: false },
      taskName: { type: 'string', empty: false },
      time_taken: { type: 'string', optional: true },
    };

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
      audio_name: audioFilePath,
      created_at: new Date(),
      score_id: scoreStore.id,
    });

    return res.status(201).json({
      message: 'Answer submitted successfully',
      data: {
        score: scoreStore,
        answer: storeAnswers,
      },
    });
  } catch (error) {
    console.error('Error submitting answer:', error.message);

    if (!res.headersSent) {
      return res.status(500).json({ error: 'An error occurred while submitting the answer.' });
    }
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
      taskName: { type: 'string', empty: false, messages: { required: 'Task name is required.' } },
      time_taken: { type: 'string', optional: true },
    };

    const validationResponse = v.validate(req.body, schema);
    if (validationResponse !== true) {
      return res.status(400).json({ errors: validationResponse });
    }

    const { ansData, questionID, taskName, time_taken } = req.body;
    const { userId } = req.userData; // Assuming JWT Middleware sets req.userData

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
