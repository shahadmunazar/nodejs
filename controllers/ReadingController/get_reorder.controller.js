const { where } = require("sequelize");
const Validator = require("fastest-validator");
const { validationResult } = require("express-validator");
const v = new Validator();
const { Question, ZoneType, TblBadges, ScoreTbl, Answer, MultipleChoiceOptionsAnswer, ReorderParagraph, TblDiscussion, Sequelize } = require("../../models"); // Ensure this line imports correctly
const { Op } = require("sequelize");

const { use } = require("../../routes/question");
const multer = require("multer");
const moment = require("moment");

const path = require("path");
const { type } = require("os");
async function GetReorderQuestion(req, res) {
  try {
    const { question_id, weekly_id, task_id, monthly_id, practice, badges_id, page = 1, per_page = 10 } = req.query;
    const task_name = 14;
    const zone_name = 3;
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
    let correctOptions = null;
    let previousQuestionId = null;
    let nextQuestionId = null;
    let latestQuestion = null;
    let para = []; // Initialize para to avoid undefined or null

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
          {
            model: ReorderParagraph,
            as: "reorderParagraphs",
            attributes: ["id", "question_id", "paragraph", "serial_no", "correct_order"],
          },
        ],
      });

      if (latestQuestion) {
        const Question_id = latestQuestion.id;
        const sort = "asc"; // Sorting flag, set by the logic of the app

        // Fetch paragraphs with correct_order sorting if needed
        const paragraphs = await ReorderParagraph.findAll({
          attributes: ["id", "paragraph", "serial_no", "correct_order", "question_id"],
          where: { question_id: Question_id },
          order: sort === "asc" ? [["correct_order", "ASC"]] : [],
        });

        para = paragraphs.map(paragraph => ({
          paragraph_id: paragraph.id,
          sentence: paragraph.paragraph,
          serial_no: paragraph.serial_no,
          correct_order: paragraph.correct_order,
        }));

        const options = latestQuestion.reorderParagraphs.map(rp => rp.get());
        const correctOptions = options.filter(option => option.correct_order === true);

        const questionBadges = badgesMap[latestQuestion.id] || [];
        const attemptCount = attemptsMap[latestQuestion.id] || 0;

        latestQuestion = {
          ...latestQuestion.get(),
          get_task: latestQuestion.get_task ? latestQuestion.get_task.get() : null,
          badges: questionBadges,
          attempt_count: attemptCount,
          correct_option: correctOptions,
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
          {
            model: ReorderParagraph,
            as: "reorderParagraphs",
            attributes: ["id", "question_id", "paragraph", "serial_no", "correct_order"],
          },
        ],
      });

      if (latestQuestion) {
        const Question_id = latestQuestion.id;
        const sort = "asc";

        const paragraphs = await ReorderParagraph.findAll({
          attributes: ["id", "paragraph", "serial_no", "correct_order", "question_id"],
          where: { question_id: Question_id },
          order: sort === "asc" ? [["correct_order", "ASC"]] : [],
        });

        para = paragraphs.map(paragraph => ({
          paragraph_id: paragraph.id,
          sentence: paragraph.paragraph,
          serial_no: paragraph.serial_no,
          correct_order: paragraph.correct_order,
        }));

        const options = latestQuestion.reorderParagraphs.map(rp => rp.get());
        const correctOptions = options.filter(option => option.correct_order === true);

        const questionBadges = badgesMap[latestQuestion.id] || [];
        const attemptCount = attemptsMap[latestQuestion.id] || 0;

        latestQuestion = {
          ...latestQuestion.get(),
          get_task: latestQuestion.get_task ? latestQuestion.get_task.get() : null,
          badges: questionBadges,
          attempt_count: attemptCount,
          correct_option: correctOptions,
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
        correct_answers: para,
        correct_option: para,
        paragraphs: para,
        // correct_option: latestQuestion ? latestQuestion.correct_option : [],
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
            { url: page < Math.ceil(totalQuestions / per_page) ? `https://yourapi.com/api/path?page=${page + 1}` : null, label: "Next &raquo;", active: false },
          ],
        },
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in GetMSQAnswer:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function SubmitReorderAnswer(req, res) {
  try {
    const schema = {
      ansData: {
        type: "array",
        items: { type: "number" },
        empty: false,
        messages: { required: "Answer data is required.", array: "Answer data must be an array of numbers." },
      },
      questionID: { type: "number", integer: true, positive: true, messages: { required: "Question ID is required." } },
      taskName: { type: "number", empty: false, messages: { required: "Task name is required." } },
      time_taken: { type: "string", empty: true, messages: { required: "Time taken is optional." } },
    };

    const validationResponse = v.validate(req.body, schema);
    if (validationResponse !== true) {
      return res.status(400).json({ errors: validationResponse });
    }

    const { ansData, questionID, taskName, time_taken } = req.body;
    const { userId: studentID } = req.userData;

    let countCorrectAnswers = 0;
    let countIncorrectAnswers = 0;

    const totalScore = await ReorderParagraph.count({
      where: { question_id: questionID, correct_order: { [Op.not]: null } },
    });
    const scoreStore = await ScoreTbl.create({
      question_id: questionID,
      task_id: taskName,
      student_id: studentID,
      time_taken: time_taken,
      zone_id: 3, // adjust this to the appropriate zone_id if necessary
      status: 1,
      created_at: new Date(),
    });

    // Process each answer in ansData
    await Promise.all(
      ansData.map(async paragraphId => {
        const paragraph = await ReorderParagraph.findOne({
          where: { id: paragraphId },
          attributes: ["id", "correct_order"],
        });

        if (!paragraph) {
          return;
        }

        let isAnswerCorrect = 0;
        if (paragraph.correct_order !== null) {
          if (paragraph.correct_order === countCorrectAnswers + 1) {
            isAnswerCorrect = 1;
            countCorrectAnswers++;
          } else {
            countIncorrectAnswers++;
          }
        }

        // Store the answer record
        await Answer.create({
          question_id: questionID,
          task_name: taskName,
          student_id: studentID,
          paragraph_id: paragraphId,
          is_answer_correct: isAnswerCorrect,
          score_id: scoreStore.id,
        });
      })
    );

    const finalScore = Math.max(countCorrectAnswers - countIncorrectAnswers, 0);

    scoreStore.score = finalScore;
    scoreStore.total_score = totalScore;
    await scoreStore.save();

    const formattedDate = moment(scoreStore.created_at).format("DD-MM-YYYY");

    return res.status(200).json({
      status: "success",
      message: "Answer submitted successfully.",
      data: {
        score_id: scoreStore.id,
        user_score: finalScore,
        total_score: totalScore,
        user_name: req.userData.name, // Assuming user data is in req.userData
        task_date: formattedDate,
        correct_answers: countCorrectAnswers,
        incorrect_answers: countIncorrectAnswers,
      },
    });
  } catch (error) {
    console.error("Error in SubmitReorderAnswer:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while submitting the answer.",
      error: error.message,
    });
  }
}

async function GetMTMAStuentScore(req, res) {
  try {
    const { taskName, questionID } = req.query;
    const { userId: studentID } = req.userData;
    const scoreData = await ScoreTbl.findAll({
      where: {
        student_id: studentID,
        task_id: taskName,
        question_id: questionID,
      },
      include: [
        {
          model: Answer,
          as: "answers",
          attributes: ["score_id", "paragraph_id"],
        },
      ],
      order: [["id", "DESC"]],
    });

    if (scoreData.length > 0) {
      const scoreResponses = await Promise.all(
        scoreData.map(async score => {
          const userAnswers = await Promise.all(
            score.answers.map(async answer => {
              const answerDetails = await MultipleChoiceOptionsAnswer.findOne({
                where: { id: answer.paragraph_id },
                attributes: ["id", "alfaSerial"],
              });
              return answerDetails;
            })
          );
          const date = score.created_at;
          const formattedDate = new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          console.log("formateeddate", date);
          return {
            score_id: score.id,
            user_score: score.score,
            total_score: score.total_score,
            user_name: req.userData.user_name,
            user_answer: userAnswers,
            task_date: formattedDate,
          };
        })
      );

      return res.status(200).json({
        status: "success",
        message: "Your answers are retrieved successfully",
        data: scoreResponses,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "No records found!",
      });
    }
  } catch (error) {
    console.error("Error fetching student scores:", error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while fetching the scores.",
      error: error.message,
    });
  }
}

module.exports = {
  GetReorderQuestion,
  SubmitReorderAnswer,
  GetMTMAStuentScore,
};
