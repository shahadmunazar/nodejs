"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ScoreTbl extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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
      content_Score_para: DataTypes.TEXT,
      form_Score_para: DataTypes.TEXT,
      grammar_Score_para: DataTypes.TEXT,
      spelling_Score_para: DataTypes.TEXT,
      vocabulary_Score_para: DataTypes.TEXT,
      linguistic_score_Para: DataTypes.TEXT,
      development_score_Para: DataTypes.TEXT,
      total_score: DataTypes.INTEGER,
      reason_for_zero: DataTypes.STRING,
      time_taken: DataTypes.STRING,
      api_transcript: DataTypes.TEXT,
      response_json: DataTypes.JSON,
      storage: DataTypes.STRING,
      status: DataTypes.TINYINT,
      email_Conventation: DataTypes.STRING,
      deleted_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ScoreTbl",
      tableName: "score_tbl", // Ensure this matches your actual table name
      timestamps: false, // Set to true if `created_at` and `updated_at` are handled by Sequelize
      underscored: true, // Set to true if your column names are underscored
    }
  );
  return ScoreTbl;
};
