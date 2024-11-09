"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("question", "monthly_id", {
      type: Sequelize.INTEGER,
      allowNull: true, // or false depending on your requirement
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("question", "monthly_id");
  },
};
