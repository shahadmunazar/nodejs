"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ReorderParagraph extends Model {
    static associate(models) {
      ReorderParagraph.belongsTo(models.Question, {
        foreignKey: "question_id",
        as: "getquestion", // Use 'getquestion' if this is the desired alias
      });
    }
  }

  ReorderParagraph.init(
    {
      id: {
        type: DataTypes.INTEGER(9),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      question_id: {
        type: DataTypes.INTEGER(9),
        allowNull: false,
      },
      paragraph: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      serial_no: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      correct_order: {
        type: DataTypes.INTEGER(2),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ReorderParagraph",
      tableName: "reorder_paragraph",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ReorderParagraph;
};
