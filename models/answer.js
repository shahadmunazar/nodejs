'use strict';
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    static associate(models) {
      Answer.belongsTo(models.ScoreTbl, {
        foreignKey: "score_id",
        as: "score",
      });
    }
  }

  Answer.init(
    {
      question_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      task_name: DataTypes.INTEGER,
      audio_name: DataTypes.STRING,
      text_answer: DataTypes.TEXT,
      analysis_answer: DataTypes.TEXT,
      paragraph_id: DataTypes.INTEGER,
      answer_blank: DataTypes.STRING,
      highlighted_answer: DataTypes.TEXT,
      is_answer_correct: DataTypes.BOOLEAN,
      score_id: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Answer",
      tableName: "tbl_answers", // Ensure this matches your actual table name
      timestamps: false, // Disable timestamps if your table does not have createdAt and updatedAt
      underscored: true, // If your column names are underscored
    }
  );

  return Answer;
};
