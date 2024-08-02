"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ScoreTbl extends Model {
    static associate(models) {
      ScoreTbl.hasMany(models.Answer, {
        foreignKey: "score_id",
        as: "answers",
      });
    }
  }

  ScoreTbl.init(
    {
      question_id: DataTypes.INTEGER,
      zone_id: DataTypes.INTEGER,
      task_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      fluency_score: DataTypes.DOUBLE,
      pronunciation_score: DataTypes.DOUBLE,
      content_score: DataTypes.DOUBLE,
      form_score: DataTypes.INTEGER,
      grammar_score: DataTypes.INTEGER,
      vocabulary_score: DataTypes.INTEGER,
      spelling_score: DataTypes.INTEGER,
      linguistic_score: DataTypes.INTEGER,
      development_score: DataTypes.INTEGER,
      score: DataTypes.DOUBLE,
      content_score_para: DataTypes.TEXT,
      form_score_para: DataTypes.TEXT,
      grammar_score_para: DataTypes.TEXT,
      spelling_score_para: DataTypes.TEXT,
      vocabulary_score_para: DataTypes.TEXT,
      linguistic_score_para: DataTypes.TEXT,
      development_score_para: DataTypes.TEXT,
      total_score: DataTypes.INTEGER,
      reason_for_zero: DataTypes.STRING,
      time_taken: DataTypes.STRING,
      api_transcript: DataTypes.TEXT,
      response_json: DataTypes.JSON,
      storage: DataTypes.STRING,
      status: DataTypes.TINYINT,
      email_convention: DataTypes.STRING,
      deleted_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ScoreTbl",
      tableName: "score_tbl",
      timestamps: false,
      underscored: true,
    }
  );

  return ScoreTbl;
};
