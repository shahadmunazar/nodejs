const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const postsRoutes = require("./routes/posts.js"); // Adjust the path based on your folder structure
const BlogsRoutes = require("./routes/blogs.js");
const UserRoutes = require("./routes/user.js");
const QuestionRoutes = require("./routes/question.js");

app.use(bodyParser.json()); // Fixed typo here
app.use("/posts", postsRoutes); // Mount the postsRoutes middleware at /posts
app.use("/blogs", BlogsRoutes);
app.use("/user", UserRoutes);
app.use("/get-question", QuestionRoutes);
module.exports = app;
