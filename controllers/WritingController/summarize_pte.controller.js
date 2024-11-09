const { where } = require("sequelize");
const Validator = require("fastest-validator");
const { validationResult } = require("express-validator");

const { Question, ZoneType, TblBadges, ScoreTbl, Answer, Sequelize } = require("../../models"); // Ensure this line imports correctly
const { use } = require("../../routes/question");
const multer = require("multer");
const path = require("path");

async function GetSwtPteCoreQuestion(req, res) {
  try {
    const { question_id, weekly_id, task_id, monthly_id, practice, badges_id, page = 1, per_page = 10 } = req.query;
    const task_name = 26;
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
    if (monthly_id == 1) {
      whereClause.monthly_id = monthly_id;
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

    let previousQuestionId = null;
    let nextQuestionId = null;
    if (question_id) {
      latestQuestion = await Question.findOne({
        where: { id: question_id, ...whereClause }, // Merging conditions
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
        const currentIndex = select_question.findIndex(q => q.id === latestQuestion.id);
        latestQuestion.next_question_id = select_question[currentIndex + 1]?.id || null;
        latestQuestion.previous_question_id = select_question[currentIndex - 1]?.id || null;
      }
    } else {
      latestQuestion = await Question.findOne({
        order: [["id", "DESC"]],
        where: whereClause,
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
        const currentIndex = select_question.findIndex(q => q.id === latestQuestion.id);
        latestQuestion.next_question_id = select_question[currentIndex + 1]?.id || null;
        latestQuestion.previous_question_id = select_question[currentIndex - 1]?.id || null;
      }
    }
    const formattedQuestionsWithBadges = questionsWithBadges.map((question, index) => ({
      id: question.id,
      serial_number: index + 1,
      next_question_id: questionsWithBadges[index + 1]?.id || null,
      previous_question_id: questionsWithBadges[index - 1]?.id || null,
      ...question,
    }));
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
        countquestion: totalCount,
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
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "An error occurred while fetching questions." });
  }
}

module.exports = {
  GetSwtPteCoreQuestion,
};
