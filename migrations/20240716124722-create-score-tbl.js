'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ScoreTbls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      question_id: {
        type: Sequelize.INTEGER
      },
      zone_id: {
        type: Sequelize.INTEGER
      },
      task_id: {
        type: Sequelize.INTEGER
      },
      student_id: {
        type: Sequelize.INTEGER
      },
      fluency_score: {
        type: Sequelize.DOUBLE
      },
      pronunciation_score: {
        type: Sequelize.DOUBLE
      },
      content_score: {
        type: Sequelize.DOUBLE
      },
      form_score: {
        type: Sequelize.INTEGER
      },
      grammar_score: {
        type: Sequelize.INTEGER
      },
      vocabulary_score: {
        type: Sequelize.INTEGER
      },
      spelling_score: {
        type: Sequelize.INTEGER
      },
      linguistic_score: {
        type: Sequelize.INTEGER
      },
      development_score: {
        type: Sequelize.INTEGER
      },
      score: {
        type: Sequelize.DOUBLE
      },
      content_Score_para: {
        type: Sequelize.TEXT
      },
      form_Score_para: {
        type: Sequelize.TEXT
      },
      grammar_Score_para: {
        type: Sequelize.TEXT
      },
      spelling_Score_para: {
        type: Sequelize.TEXT
      },
      vocabulary_Score_para: {
        type: Sequelize.TEXT
      },
      linguistic_score_Para: {
        type: Sequelize.TEXT
      },
      development_score_Para: {
        type: Sequelize.TEXT
      },
      total_score: {
        type: Sequelize.INTEGER
      },
      reason_for_zero: {
        type: Sequelize.STRING
      },
      time_taken: {
        type: Sequelize.STRING
      },
      api_transcript: {
        type: Sequelize.TEXT
      },
      response_json: {
        type: Sequelize.JSON
      },
      storage: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.TINYINT
      },
      email_Conventation: {
        type: Sequelize.STRING
      },
      deleted_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ScoreTbls');
  }
};