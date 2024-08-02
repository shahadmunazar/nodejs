"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      Question.hasOne(models.ZoneType, { foreignKey: "id", sourceKey: "task_name", as: "get_task" });
      Question.hasMany(models.ScoreTbl, {
        foreignKey: "question_id",
        sourceKey: "id",
        as: "scores",
        scope: options => {
          return {
            student_id: sequelize.where(sequelize.col("scores.student_id"), options.authId),
          };
        },
      });

      Question.hasMany(models.TblBadges, {
        foreignKey: "question_id",
        sourceKey: "id",
        as: "badges",
      });
    }
  }
  Question.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      zone_name: DataTypes.INTEGER,
      mocktest: DataTypes.STRING,
      task_name: DataTypes.STRING,
      practice_id: DataTypes.INTEGER,
      weekly_id: DataTypes.INTEGER,
      mocktest_id: DataTypes.INTEGER,
      grammar_based: {
        type: DataTypes.INTEGER.UNSIGNED.ZEROFILL,
        defaultValue: 0,
      },
      connector_based: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
      },
      question_name: DataTypes.STRING,
      answer_options: DataTypes.STRING,
      audio: DataTypes.STRING,
      is_score_minus: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      about_question: DataTypes.TEXT,
      description: DataTypes.TEXT,
      badges_tags: DataTypes.STRING,
      images: DataTypes.STRING,
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Question",
      tableName: "question", // Make sure this matches your actual table name
      timestamps: false, // Set to true if `created_at` and `updated_at` are handled by Sequelize
      underscored: true, // Set to true if your column names are underscored
      // Other model options if needed
    }
  );

  return Question;
};
