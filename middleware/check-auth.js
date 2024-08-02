// middleware/check-auth.js

const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY || "secret");
    req.userData = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or Expired Token provided",
      error: error.message,
    });
  }
};

module.exports = {
  checkAuth,
};
