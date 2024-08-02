const { where } = require("sequelize");
const { post, use } = require("../app");
const Validator = require("fastest-validator");

const models = require("../models/");

function save(req, res) {
  const post = {
    title: req.body.title,
    content: req.body.content,
    imageUrl: req.body.imageUrl,
    categoryId: req.body.categoryId,
    userId: req.body.userId,
  };

  const schema = {
    title: { type: "string", optional: false, max: "1000" },
    content: { type: "string", optional: false, max: "1999" },
    imageUrl: { type: "string", optional: true },
    categoryId: { type: "number", optional: false },
    userId: { type: "number", optional: false },
  };

  const v = new Validator();
  const validationResponse = v.validate(post, schema);

  if (validationResponse !== true) {
    return res.status(403).json({
      message: "Validation Failed",
      errors: validationResponse,
    });
  }

  models.Post.create(post)
    .then(result => {
      res.status(201).json({
        message: "Post Created Successfully",
        post: result,
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Creating post failed",
        error: error.message,
      });
    });
}

function show(req, res) {
  const id = req.params.id;

  models.Post.findByPk(id)
    .then(result => {
      res.status(201).json({
        message: "Retrieved  Data Successfully",
        post: result,
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Some Thing Went Wrong Please try Agaian Later",
        error: error.message,
      });
    });
}

function index(req, res) {
  models.Post.findAll()
    .then(result => {
      res.status(201).json({
        message: "All Data Retrieved Successfully",
        post: result,
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Some Thing Went Wrong Please try Agaian Later",
        error: error.message,
      });
    });
}

function update(req, res) {
  const id = req.params.id;
  const updatedPost = {
    title: req.body.title,
    content: req.body.content,
    imageUrl: req.body.imageUrl,
    categoryId: req.body.categoryId,
  };
  const userId = req.body.userId;

  models.Post.update(updatedPost, { where: { id: id, userId: userId } })
    .then(result => {
      if (result[0] === 1) {
        res.status(200).json({
          message: "Post Updated Successfully",
          post: updatedPost,
        });
      } else {
        res.status(404).json({
          message: "Post not found or user not authorized",
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Something Went Wrong. Please try Again Later",
        error: error.message,
      });
    });
}

function destroy(req, res) {
  const id = req.params.id;
  const userId = 1;
  models.Post.findOne({ where: { id: id, userId: userId } })
    .then(post => {
      if (!post) {
        return res.status(404).json({
          message: "Post not found or user not authorized to delete this post",
        });
      }
      return models.Post.destroy({ where: { id: id, userId: userId } }).then(() => {
        res.status(200).json({
          message: "Post Data deleted successfully",
          post: post,
        });
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Something went wrong, please try again later",
        error: error.message,
      });
    });
}

module.exports = {
  save: save,
  show: show,
  index: index,
  update: update,
  destroy: destroy,
};
