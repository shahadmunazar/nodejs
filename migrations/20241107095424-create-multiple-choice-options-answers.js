"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("multiple_choice_options_answers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      options: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      correct_answers: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      alfaSerial: {
        type: Sequelize.STRING(2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("multiple_choice_options_answers");
  },
};
