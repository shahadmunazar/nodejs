'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FillBlankParagraphs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reading_fill_blank_id: {
        type: Sequelize.INTEGER
      },
      paragraph: {
        type: Sequelize.TEXT
      },
      correct_answer: {
        type: Sequelize.STRING
      },
      answer_option_dropdown: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('FillBlankParagraphs');
  }
};