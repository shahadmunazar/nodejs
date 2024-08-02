'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Answer.init({
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
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Answer',
  });
  return Answer;
};