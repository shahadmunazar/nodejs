"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TblBadges extends Model {
    static associate(models) {
      // Define association with Question
      TblBadges.belongsTo(models.Question, {
        foreignKey: "question_id",
        targetKey: "id",
        as: "question",
      });
    }
  }
  TblBadges.init(
    {
      student_id: DataTypes.INTEGER,
      question_id: DataTypes.INTEGER,
      task_id: DataTypes.INTEGER,
      badges: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "TblBadges",
      tableName: "tbl_badges",
    }
  );

  return TblBadges;
};
