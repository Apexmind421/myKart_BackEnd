// Packages
const jwt = require("jsonwebtoken");
const moment = require("moment");

// Configs
const config = require("../config/config");
const tokenTypes = require("../config/tokens");

// Models
//import { User, Token } from "../models/index";
const User = require("../models/user");
const Token = require("../models/token");

/**
 * Generate token
 * @param   { ObjectId }  userId
 * @param   { Date }      expires
 * @param   { String }    type
 * @returns { String }
 */
/*
export const generateToken = (
  userId,
  expires,
  type,
  secret = config.jwt.secret
) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type
  };
  return jwt.sign(payload, secret);
};
*/
const generateToken = (userId, expiresIn, role, secret) => {
  const payload = {
    _id: userId,
    role: role,
  };
  const expiryDetails = { expiresIn: expiresIn };
  return jwt.sign(payload, secret, expiryDetails);
};
/**
 * Save a token
 * @param   { String }    token
 * @param   { ObjectId }  userId
 * @param   { Date }      expires
 * @param   { String }    type
 * @returns { Promise <Token> }
 */
const saveToken = async (token, userId, expires, type) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
  });

  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param   { String } token
 * @param   { String } type
 * @returns { Promise <Token> }
 */
module.exports.verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);

  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
  });

  if (!tokenDoc) {
    return {
      type: "Error",
      statusCode: 404,
      message: "Token not found.",
    };
  }

  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param   { Object } user
 * @returns { Promise <Tokens> }
 */
module.exports.generateAuthTokens = async (user) => {
  const accessTokenExpires = "3h"; //TODO:Change to Config;

  const accessToken = generateToken(
    user.id,
    accessTokenExpires,
    user.role,
    process.env.JWT_SECRET //TODO: Use config to set tokenTypes.ACCESS
  );

  const refreshTokenExpires = "3w";
  /*TO DO : Change to Config
    moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );*/

  const refreshToken = generateToken(
    user.id,
    refreshTokenExpires,
    user.role,
    process.env.REFRESH_TOKEN_SECRET //TODO: Use config to set tokenTypes.REFRESH
  );

  const expiryTime = moment().add(21, "days");
  await saveToken(refreshToken, user.id, expiryTime, "refresh"); //tokenTypes.REFRESH);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Generate reset password token
 * @param   { String } email
 * @returns { Promise <Token> }
 */
module.exports.generateResetPasswordToken = async (email) => {
  // 1) Extract user data from database
  const user = await User.findOne({ email });

  // 2) Check if user does not exist
  if (!user) {
    return {
      type: "Error",
      statusCode: 404,
      message: `No user found with this email ${email}`,
    };
  }

  const expires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minutes"
  );

  const resetPasswordToken = generateToken(
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );

  await saveToken(
    resetPasswordToken,
    user.id,
    expires,
    tokenTypes.RESET_PASSWORD
  );

  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param   { Object } user
 * @returns { Promise <Token> }
 */
module.exports.generateVerifyEmailToken = async (user) => {
  const expires = moment().add(
    config.jwt.verifyEmailExpirationMinutes,
    "minutes"
  );

  const verifyEmailToken = generateToken(
    user.id,
    expires,
    tokenTypes.VERIFY_EMAIL
  );

  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);

  return verifyEmailToken;
};
