"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tbl_answers", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      question_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      student_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      task_name: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      audio_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      text_answer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      analysis_answer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paragraph_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      answer_blank: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      highlighted_answer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_answer_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      score_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("tbl_answers", ["student_id", "task_name", "score_id"]);
    await queryInterface.addIndex("tbl_answers", ["score_id"]);
    await queryInterface.addIndex("tbl_answers", ["task_name"]);
    await queryInterface.addIndex("tbl_answers", ["student_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tbl_answers");
  },
};
