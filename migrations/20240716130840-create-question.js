"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("question", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(111),
      },
      zone_name: {
        type: Sequelize.INTEGER(111),
        defaultValue: null,
      },
      mocktest: {
        type: Sequelize.STRING(111),
        defaultValue: null,
      },
      task_name: {
        type: Sequelize.STRING(100),
        defaultValue: "0",
      },
      practice_id: {
        type: Sequelize.INTEGER(1),
        defaultValue: "0",
      },
      weekly_id: {
        type: Sequelize.INTEGER(1),
        defaultValue: "0",
      },
      mocktest_id: {
        type: Sequelize.INTEGER(111),
        defaultValue: "0",
      },
      grammar_based: {
        type: Sequelize.INTEGER(1).UNSIGNED.ZEROFILL,
        defaultValue: "0",
      },
      connector_based: {
        type: Sequelize.INTEGER(1).UNSIGNED,
        defaultValue: "0",
      },
      question_name: {
        type: Sequelize.STRING(222),
        defaultValue: null,
      },
      answer_options: {
        type: Sequelize.STRING(222),
        defaultValue: null,
      },
      audio: {
        type: Sequelize.STRING(222),
        defaultValue: null,
      },
      is_score_minus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      about_question: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      description: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      badges_tags: {
        type: Sequelize.STRING(100),
        defaultValue: null,
      },
      images: {
        type: Sequelize.STRING(255),
        defaultValue: null,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      // Define indexes as needed
      // For example:
      id: {
        type: Sequelize.INTEGER(111),
        primaryKey: true,
        autoIncrement: true,
      },
      task_name: {
        type: Sequelize.STRING(100),
      },
      zone_name: {
        type: Sequelize.INTEGER(111),
      },
      question_name: {
        type: Sequelize.STRING(222),
      },
      answer_options: {
        type: Sequelize.STRING(222),
      },
    });

    // Define indexes here if needed
    // For example:
    await queryInterface.addIndex("question", ["task_name"]);
    await queryInterface.addIndex("question", ["zone_name"]);
    await queryInterface.addIndex("question", ["question_name"]);
    await queryInterface.addIndex("question", ["answer_options"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("question");
  },
};
