const { where } = require("sequelize");
const Validator = require("fastest-validator");

const { Question, ZoneType, TblBadges, ScoreTbl, Answer, Sequelize } = require("../models"); // Ensure this line imports correctly
const { use } = require("../routes/question");

async function getQuestionsWithScores(req, res) {
  try {
    const { question_id, weekly_id, task_id, practice, badges_id, page = 1, per_page = 10 } = req.query;
    const task_name = 10;
    const zone_name = 2;
    const { userId } = req.userData;
    console.log(userId);

    let whereClause = {};
    if (task_name) {
      whereClause.task_name = task_name;
    }
    if (zone_name) {
      whereClause.zone_name = zone_name;
    }
    if (weekly_id) {
      whereClause.weekly_id = weekly_id;
    }

    let questions = await Question.findAll({
      where: whereClause,
      include: [
        {
          model: ZoneType,
          as: "get_task",
          attributes: ["zone_id", "name", "instructions", "time_allowed", "tasks_position"],
          required: true,
        },
      ],
      order: [["id", "DESC"]],
    });

    let select_question = await Question.findAll({
      where: whereClause,
      order: [["id", "DESC"]],
      attributes: ["id", "question_name"],
    });

    select_question = select_question.map((question, index) => ({
      id: question.id,
      question_name: question.question_name,
      next_question_id: select_question[index + 1]?.id || null,
      previous_question_id: select_question[index - 1]?.id || null,
    }));

    console.log(select_question);

    const offset = (page - 1) * per_page;

    let { count: totalQuestions, rows: allQuestions } = await Question.findAndCountAll({
      where: whereClause,
      order: [["id", "DESC"]],
      limit: parseInt(per_page),
      offset: parseInt(offset),
    });

    let badges = [];
    if (badges_id) {
      badges = await TblBadges.findAll({
        where: {
          student_id: userId,
          badges: badges_id,
          ...(task_id ? { task_id } : {}),
        },
        attributes: ["question_id", "badges"],
      });
    }

    const badgesMap = badges.reduce((map, badge) => {
      if (!map[badge.question_id]) {
        map[badge.question_id] = [];
      }
      map[badge.question_id].push(badge.badges);
      return map;
    }, {});

    const attempts = await ScoreTbl.findAll({
      where: {
        student_id: userId,
        ...(task_id ? { task_id } : {}),
      },
      attributes: ["question_id", [Sequelize.fn("COUNT", Sequelize.col("question_id")), "attempt_count"]],
      group: ["question_id"],
    });

    const attemptsMap = attempts.reduce((map, attempt) => {
      map[attempt.question_id] = attempt.get("attempt_count");
      return map;
    }, {});

    if (practice) {
      if (practice === "1") {
        questions = questions.filter(question => attemptsMap[question.id] > 0);
      } else if (practice === "2") {
        const attemptedQuestionIds = Object.keys(attemptsMap);
        questions = questions.filter(question => !attemptedQuestionIds.includes(String(question.id)));
      }
    }

    if (badges_id) {
      questions = questions.filter(question => badgesMap[question.id]?.includes(badges_id));
    }

    const questionsWithBadges = questions.map(question => {
      const questionBadges = badgesMap[question.id] || [];
      const attemptCount = attemptsMap[question.id] || 0;
      return {
        ...question.get(),
        get_task: question.get_task ? question.get_task.get() : null,
        badges: questionBadges,
        attempt_count: attemptCount,
      };
    });

    const totalCount = questionsWithBadges.length;

    const CounttotalCount = questionsWithBadges.length;

    let previousQuestionId = null;
    let nextQuestionId = null;

    if (question_id || questionsWithBadges.length > 0) {
      const currentQuestionIndex = questionsWithBadges.findIndex(q => q.id == question_id);

      if (currentQuestionIndex !== -1) {
        previousQuestionId = questionsWithBadges[currentQuestionIndex - 1]?.id || null;
        nextQuestionId = questionsWithBadges[currentQuestionIndex + 1]?.id || null;
      } else if (!question_id && questionsWithBadges.length > 0) {
        previousQuestionId = null;
        nextQuestionId = questionsWithBadges[0]?.id || null;
      }
    }

    let latestQuestion = null;
    if (totalCount === 0 || question_id === null) {
      latestQuestion = await Question.findOne({
        order: [["id", "DESC"]],
        include: [
          {
            model: ZoneType,
            as: "get_task",
            attributes: ["zone_id", "name", "instructions", "time_allowed", "tasks_position"],
            required: true,
          },
        ],
      });

      if (latestQuestion) {
        const questionBadges = badgesMap[latestQuestion.id] || [];
        const attemptCount = attemptsMap[latestQuestion.id] || 0;
        latestQuestion = {
          ...latestQuestion.get(),
          get_task: latestQuestion.get_task ? latestQuestion.get_task.get() : null,
          badges: questionBadges,
          attempt_count: attemptCount,
        };
      }
    }

    const formattedQuestionsWithBadges = questionsWithBadges.map((question, index) => {
      return {
        id: question.id,
        serial_number: index + 1,
        next_question_id: questionsWithBadges[index + 1]?.id || null,
        previous_question_id: questionsWithBadges[index - 1]?.id || null,
        ...question,
      };
    });

    const response = {
      status: 200,
      data: {
        question:
          latestQuestion ||
          (formattedQuestionsWithBadges.length > 0
            ? {
                ...formattedQuestionsWithBadges[0],
                total_count_questions: totalCount,
                previous_question_id: previousQuestionId,
                next_question_id: nextQuestionId,
              }
            : null),
        allquestionsapp: formattedQuestionsWithBadges,
        countquestion: CounttotalCount,
        total_count_questions: totalCount,
        all_questions: {
          current_page: parseInt(page),
          data: allQuestions,
          first_page_url: `https://yourapi.com/api/path?page=1`,
          from: offset + 1,
          last_page: Math.ceil(totalQuestions / per_page),
          last_page_url: `https://yourapi.com/api/path?page=${Math.ceil(totalQuestions / per_page)}`,
          links: [
            { url: page > 1 ? `https://yourapi.com/api/path?page=${page - 1}` : null, label: "&laquo; Previous", active: false },
            ...Array.from({ length: Math.ceil(totalQuestions / per_page) }, (_, i) => ({
              url: `https://yourapi.com/api/path?page=${i + 1}`,
              label: `${i + 1}`,
              active: i + 1 === parseInt(page),
            })),
            { url: page < Math.ceil(totalQuestions / per_page) ? `https://yourapi.com/api/path?page=${parseInt(page) + 1}` : null, label: "Next &raquo;", active: false },
          ],
          next_page_url: page < Math.ceil(totalQuestions / per_page) ? `https://yourapi.com/api/path?page=${parseInt(page) + 1}` : null,
          path: `https://yourapi.com/api/path`,
          per_page: parseInt(per_page),
          prev_page_url: page > 1 ? `https://yourapi.com/api/path?page=${page - 1}` : null,
          to: offset + allQuestions.length,
          total: totalQuestions,
        },
        select_question: select_question,
      },
    };

    console.log(`Total Questions Found: ${totalCount}`);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "An error occurred while fetching questions." });
  }
}

async function SubmitQuestion(req, res) {
  try {
    const schema = {
      questionID: { type: "number", integer: true, positive: true },
      ansData: { type: "string", min: 1 },
      taskName: { type: "number", integer: true, positive: true },
      time_taken: { type: "string", min: 1 },
      zone_name: { type: "number", integer: true, positive: true },
    };

    const { userId } = req.userData;
    const { questionID, taskName, time_taken, zone_name, ansData } = req.body;

    const v = new Validator();
    const validationResponse = v.validate(req.body, schema);

    if (validationResponse !== true) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResponse,
      });
    }

    // Create the ScoreTbl entry
    const scoreResult = await ScoreTbl.create({
      question_id: questionID,
      student_id: userId,
      task_id: taskName,
      time_taken,
      zone_id: zone_name,
    });

    // Use the newly created score_id
    const score_id = scoreResult.id;
    console.log(score_id);

    // Create the Answer entry
    const answerResult = await Answer.create({
      question_id: questionID,
      student_id: userId,
      task_name: taskName,
      text_answer: ansData,
      score_id: score_id,
    });

    return res.status(200).json({
      message: "Question Answer Submitted Successfully",
      post: answerResult,
    });
  } catch (error) {
    console.error("Error submitting question:", error);
    return res.status(500).json({
      message: "An error occurred while submitting the question answer.",
    });
  }
}

async function getUserScoreSwt(req, res) {
  try {
    const v = new Validator();

    // Validation schema
    const schema = {
      questionID: { type: "number", number: true, positive: true, required: true },
      taskid: { type: "number", number: true, positive: true, required: true },
    };

    // Extract parameters
    const questionID = parseInt(req.query.questionID, 10);
    const taskid = parseInt(req.query.taskid, 10);
    const { userId } = req.userData; // Ensure userId is available in req.userData

    // Validate parameters
    const validationResponse = v.validate({ questionID, taskid }, schema);
    if (validationResponse !== true) {
      return res.status(403).json({
        status: 403,
        error: validationResponse,
      });
    }
    const userScore = await ScoreTbl.findAll({
      attributes: [
        "id",
        "question_id",
        "zone_id",
        "task_id",
        "student_id",
        "fluency_score",
        "pronunciation_score",
        "content_score",
        "form_score",
        "grammar_score",
        "vocabulary_score",
        "spelling_score",
        "linguistic_score",
        "development_score",
        "score",
        "content_score_para",
        "form_score_para",
        "grammar_score_para",
        "spelling_score_para",
        "vocabulary_score_para",
        "linguistic_score_para",
        "development_score_para",
        "total_score",
        "reason_for_zero",
        "time_taken",
        "api_transcript",
        "response_json",
        "storage",
        "status",
        "email_Conventation",
        "deleted_at",
      ],
      where: {
        question_id: questionID,
        student_id: userId,
        task_id: taskid,
      },
    });
    if (!userScore) {
      return res.status(404).json({
        status: 404,
        message: "No score found for the given criteria.",
      });
    }
    return res.status(200).json({
      status: 200,
      data: userScore,
      message: "Score retrieved successfully.",
    });
  } catch (error) {
    console.error("Error getting user score:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while processing your request.",
    });
  }
}
module.exports = {
  getUserScoreSwt,
  getQuestionsWithScores,
  SubmitQuestion,
};
