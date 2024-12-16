const { where } = require("sequelize");
const Validator = require("fastest-validator");
const { validationResult } = require("express-validator");
const v = new Validator(); // Initialize the validator instance
const { Question, ZoneType, TblBadges, ScoreTbl, Answer, TblDiscussion, Sequelize } = require("../../models"); // Ensure this line imports correctly
const { use } = require("../../routes/question");
const multer = require("multer");

const moment = require("moment"); // Import moment library

const path = require("path");
const { type } = require("os");
async function GetDescribeImageQuestion(req, res) {
  try {
    const { question_id, weekly_id, task_id, monthly_id, practice, badges_id, page = 1, per_page = 10 } = req.query;
    const task_name = 7;
    const zone_name = 1;
    const { userId } = req.userData;
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
        where: { id: question_id, ...whereClause },
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
          image_path: `${req.protocol}://${req.get("host")}/uploads/questions/question_images/${latestQuestion.images}`,
          audio_path: `${req.protocol}://${req.get("host")}/uploads/questions/audio_files/${latestQuestion.audio}`,
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
          image_path: `${req.protocol}://${req.get("host")}/uploads/questions/question_images/${latestQuestion.images}`,
          audio_path: `${req.protocol}://${req.get("host")}/uploads/questions/audio_files/${latestQuestion.audio}`,
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

async function GetDIStudentScore(req, res) {
  try {
    const v = new Validator();
    const schema = {
      questionID: { type: "number", number: true, positive: true, required: true },
      taskid: { type: "number", number: true, positive: true, required: true },
    };
    const questionID = parseInt(req.query.questionID, 10);
    const taskid = parseInt(req.query.taskid, 10);
    const { userId } = req.userData;
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

async function SubmitSwtAnswer(req, res) {
  try {
    const schema = {
      ansData: { type: "string", empty: false, messages: { required: "Answer data is required." } },
      questionID: { type: "number", integer: true, positive: true, messages: { required: "Question ID is required." } },
      taskName: { type: "number", empty: false, messages: { required: "Task name is required." } },
      time_taken: { type: "string", empty: true, messages: { required: "Time taken is Optioanl." } },
    };
    console.log(schema);
    const validationResponse = v.validate(req.body, schema);
    if (validationResponse !== true) {
      return res.status(400).json({ errors: validationResponse });
    }
    const { ansData, questionID, taskName, time_taken } = req.body;
    const { userId } = req.userData;

    const AddData = {
      ansData,
      questionID,
      taskName,
      time_taken,
    };
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
      message: "Answer submitted successfully",
      data: {
        score: scoreStore,
        answer: storeAnswers,
      },
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "An error occurred while submitting the answer." });
  }
}

async function SubmitSWTBadges(req, res) {
  try {
    const schema = {
      task_id: { type: "number", integer: true, positive: true, messages: { required: "Task ID is required." } },
      badges: { type: "number", integer: true, positive: true, messages: { required: "Badges is required." } },
      questionID: { type: "number", integer: true, positive: true, messages: { required: "Question ID is required." } },
    };
    const validationResponse = v.validate(req.body, schema);
    if (validationResponse !== true) {
      return res.status(400).json({ errors: validationResponse });
    }
    const { task_id, badges, questionID } = req.body;
    const { userId: student_id } = req.userData;
    const existingBadge = await TblBadges.findOne({
      where: {
        task_id: task_id,
        student_id: student_id,
        question_id: questionID,
      },
    });
    if (existingBadge) {
      await TblBadges.update(
        { badges: badges },
        {
          where: {
            task_id: task_id,
            student_id: student_id,
            question_id: questionID,
          },
        }
      );
      res.status(200).json({
        status: 200,
        data: { badges_id: badges },
        message: "Updated into Badges",
      });
    } else {
      const newBadge = await TblBadges.create({
        student_id: student_id,
        question_id: questionID,
        task_id: task_id,
        badges: badges,
      });
      res.status(200).json({
        status: 200,
        data: { badges_id: badges },
        message: "Added into Badges",
      });
    }
  } catch (error) {
    console.error("Error handling badges:", error);
    res.status(500).json({ error: "An error occurred while processing badges." });
  }
}

async function SubmitSwtDiscussion(req, res) {
  try {
    const schema = {
      task_id: { type: "number", integer: true, positive: true, messages: { required: "Task ID is required." } },
      questionID: { type: "number", integer: true, positive: true, messages: { required: "Question ID is required." } },
      comments: { type: "string", string: true, positive: true, messages: { required: "Comments are required." } },
    };

    const validationResponse = v.validate(req.body, schema);
    if (validationResponse !== true) {
      return res.status(400).json({ errors: validationResponse });
    }

    const { task_id, questionID, comments } = req.body;
    const { userId: student_id } = req.userData;
    const task_date = moment().format("DD-MM-YYYY HH:mm:ss");
    const newDiscussion = await TblDiscussion.create({
      student_id: student_id,
      question_id: questionID,
      task_id: task_id,
      message: comments,
      task_date: task_date,
    });

    res.status(201).json({ message: "Discussion submitted successfully", data: newDiscussion });
  } catch (error) {
    console.error("Error submitting discussion:", error);
    res.status(500).json({ error: "An error occurred while submitting the discussion." });
  }
}

async function GetDiscussionSwt(req, res) {
  try {
    const { questionID, taskid } = req.query;
    const { userId: student_id } = req.userData;
    const discussions = await TblDiscussion.findAll({
      where: {
        student_id: student_id,
        task_id: taskid,
        question_id: questionID,
      },
      raw: true,
    });

    if (discussions.length === 0) {
      return res.status(404).json({ message: "No discussions found." });
    }

    res.status(200).json({
      message: "Discussions retrieved successfully",
      data: discussions,
    });
  } catch (error) {
    console.error("Error retrieving discussions:", error);
    res.status(500).json({ error: "An error occurred while retrieving the discussions." });
  }
}

async function DeleteSWtScore(req, res) {
  try {
    const schema = {
      score_id: { type: "number", integer: true, positive: true, messages: { required: "Score ID is required." } },
    };
    const validationResponse = v.validate(req.body, schema);
    if (validationResponse !== true) {
      return res.status(400).json({ errors: validationResponse });
    }

    const { score_id } = req.body;
    const { userId: student_id } = req.userData;

    const scoreRecord = await ScoreTbl.findOne({
      where: { id: score_id, student_id: student_id }, // Ensure it's the student's score
    });

    if (!scoreRecord) {
      return res.status(404).json({ message: "Score not found." });
    }

    await scoreRecord.destroy();

    await Answer.destroy({
      where: { score_id: score_id, student_id: student_id },
    });
    return res.status(200).json({
      message: "Score and corresponding answers deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting score and answers:", error);
    return res.status(500).json({ error: "An error occurred while deleting the score and answers." });
  }
}

module.exports = {
  GetDescribeImageQuestion,
  GetDIStudentScore,
  SubmitSwtAnswer,
  SubmitSWTBadges,
  SubmitSwtDiscussion,
  GetDiscussionSwt,
  DeleteSWtScore,
};
