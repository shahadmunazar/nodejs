'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fill_blank_paragraph', {
      id: {
        type: Sequelize.INTEGER(8),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      reading_fill_blank_id: {
        type: Sequelize.INTEGER(8),
        allowNull: false,
      },
      paragraph: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      correct_answer: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      answer_option_dropdown: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        comment: 'Questions ID',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('fill_blank_paragraph', ['id', 'reading_fill_blank_id']);
    await queryInterface.addIndex('fill_blank_paragraph', ['reading_fill_blank_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fill_blank_paragraph');
  },
};
