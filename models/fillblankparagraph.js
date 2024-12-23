"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FillBlankParagraph extends Model {
    /**
     * Associations can be defined here
     */
    static associate(models) {
      FillBlankParagraph.belongsTo(models.ReadingFillBlank, {
        foreignKey: "reading_fill_blank_id",
        as: "readingFillBlank",
      });
      FillBlankParagraph.belongsTo(models.Question, {
        foreignKey: "reading_fill_blank_id",
        as: "question", 
        onDelete: "CASCADE",
      });
    }
  }

  FillBlankParagraph.init(
    {
      id: {
        type: DataTypes.INTEGER(8),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      reading_fill_blank_id: {
        type: DataTypes.INTEGER(8),
        allowNull: false,
      },
      
      paragraph: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      correct_answer: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      answer_option_dropdown: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
        comment: "Questions ID",
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
        onUpdate: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "FillBlankParagraph",
      tableName: "fill_blank_paragraph",
      timestamps: true,
      underscored: true,
    }
  );

  FillBlankParagraph.associate = models => {
    FillBlankParagraph.belongsTo(models.Question, {
      foreignKey: "reading_fill_blank_id",
      as: "question",
    });
  };
  return FillBlankParagraph;
};
