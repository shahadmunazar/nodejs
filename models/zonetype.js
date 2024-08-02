"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ZoneType extends Model {
    static associate(models) {
      ZoneType.belongsTo(models.Question, { foreignKey: "id", targetKey: "task_name" });
    }
  }

  ZoneType.init(
    {
      zone_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      instructions: DataTypes.TEXT,
      time_allowed: DataTypes.INTEGER,
      tasks_position: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ZoneType",
      tableName: "zonetype",
    }
  );

  return ZoneType;
};
