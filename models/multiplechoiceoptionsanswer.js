"use strict";

module.exports = (sequelize, DataTypes) => {
  const MultipleChoiceOptionsAnswer = sequelize.define(
    "MultipleChoiceOptionsAnswer",
    {
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Questions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      options: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      correct_answers: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      alfaSerial: {
        type: DataTypes.STRING(2),
        allowNull: false,
        field: "alfa_serial", // Explicitly map to the column name in the database
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    },
    {
      tableName: "multiple_choice_options_answers",
      timestamps: true,
      underscored: true,
    }
  );

  MultipleChoiceOptionsAnswer.associate = models => {
    MultipleChoiceOptionsAnswer.belongsTo(models.Question, {
      foreignKey: "question_id",
      as: "question",
    });
  };

  return MultipleChoiceOptionsAnswer;
};
