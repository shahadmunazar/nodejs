"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TblDiscussion extends Model {
    static associate(models) {
      // define association here if needed
    }
  }

  TblDiscussion.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      question_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      task_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      },
      task_date: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "TblDiscussion",
      tableName: "tbl_discussion",
      timestamps: true,
      underscored: true,
    }
  );

  return TblDiscussion;
};
