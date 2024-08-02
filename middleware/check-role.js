// middleware/check-role.js

const checkRole = role => {
  return (req, res, next) => {
    if (req.userData.role !== role) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }
    next();
  };
};

module.exports = {
  checkRole,
};
