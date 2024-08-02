const { where } = require("sequelize");
const Validator = require("fastest-validator");

const { Question, ZoneType, TblBadges, ScoreTbl, Sequelize } = require("../models");

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
    const post = {
      questionID: req.body.questionID,
      ansData: req.body.ansData,
      taskName: req.body.taskName,
      time_taken: req.body.time_taken,
      zone_name: req.body.zone_name, // Fixed to use zone_name from req.body
    };

    // Define schema using fastest-validator
    const schema = {
      questionID: { type: "number", integer: true, positive: true },
      ansData: { type: "string", min: 1 },
      taskName: { type: "number", integer: true, positive: true },
      time_taken: { type: "string", min: 1 },
      zone_name: { type: "number", integer: true, positive: true },
    };

    const v = new Validator();
    const validationResponse = v.validate(post, schema);

    if (validationResponse !== true) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResponse,
      });
    }

    // Create the record in the database
    const result = await models.ScoreTbl.create(post);

    return res.status(200).json({
      message: "Question Answer Submitted Successfully",
      post: result,
    });
  } catch (error) {
    console.error("Error submitting question:", error);
    return res.status(500).json({
      message: "An error occurred while submitting the question answer.",
    });
  }
}

module.exports = {
  getQuestionsWithScores,
  SubmitQuestion,
};
