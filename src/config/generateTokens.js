const jwt = require("jsonwebtoken");

const generateAuthTokens = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const generateRefreshToken = (_id) => {
  return jwt.sign({ _id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "3d",
  });
};

const generateResetPasswordToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: "5m" });
};

module.exports = {
  generateAuthTokens,
  generateRefreshToken,
  generateResetPasswordToken,
};
