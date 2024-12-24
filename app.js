const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const app = express();
const postsRoutes = require("./routes/posts.js");
const BlogsRoutes = require("./routes/blogs.js");
const UserRoutes = require("./routes/user.js");
const QuestionRoutes = require("./routes/question.js");

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json()); 
app.use("/posts", postsRoutes);
app.use("/blogs", BlogsRoutes);
app.use("/user", UserRoutes);
app.use("/get-question", QuestionRoutes);
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));





module.exports = app;
