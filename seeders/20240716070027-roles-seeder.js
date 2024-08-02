"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Roles",
      [
        {
          role: "user",
          name: "User Role",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          role: "admin",
          name: "Admin Role",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          role: "subadmin",
          name: "Subadmin Role",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          role: "superadmin",
          name: "Superadmin Role",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all roles
    return queryInterface.bulkDelete("Roles", null, {});
  },
};
