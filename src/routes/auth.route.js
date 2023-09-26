// Packages
const express = require("express");

// Controllers
const {
  signin,
  signup,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  changePassword,
} = require("../controller/auth.controller");

// Utils
//import { singleFile } from "../utils/multer";

// Middlewares
//import protect from '../middlewares/protect';
/*
const {
  signin,
  signup,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  changePassword,
} = authController;*/
const {
  validateRegisterRequest,
  validateLoginRequest,
  requireLogin,
  isRequestValidated,
} = require("../Validators/validation");

const router = express.Router();

//router.post('/login', signin);

router.post("/register", validateRegisterRequest, isRequestValidated, signup);
/*
router.post('/logout', logout);

router.post('/tokens', refreshTokens);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

router.post('/verify-email', verifyEmail);

//router.use(protect);

router.post('/send-verification-email', sendVerificationEmail);

router.patch('/change-password', changePassword);
*/
module.exports = router;
