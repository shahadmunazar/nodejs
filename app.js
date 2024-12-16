const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import CORS

const path = require("path");

const app = express();

// Import routes
const postsRoutes = require("./routes/posts.js");
const BlogsRoutes = require("./routes/blogs.js");
const UserRoutes = require("./routes/user.js");
const QuestionRoutes = require("./routes/question.js");

// CORS configuration to allow all origins
const corsOptions = {
  origin: "*", // Allow all origins (use specific origins in production)
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow credentials (cookies, etc.)
};

app.use(cors(corsOptions));
app.use(bodyParser.json()); 

// Mount routes
app.use("/posts", postsRoutes); // Mount the postsRoutes middleware at /posts
app.use("/blogs", BlogsRoutes);
app.use("/user", UserRoutes);
app.use("/get-question", QuestionRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


module.exports = app;
