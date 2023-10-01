const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {
  register,
  loginUser,
  verifyPhoneOtp,
  resendPhoneOtp,
  logout,
  user_edit,
  deleteUserById,
  handleRefreshToken,
  user_photoUpload,
  forgotPassword,
  updatePassword,
  resetPassword,
} = require("../controller/auth");
const { getUserReviews } = require("../controller/reviews");
const {
  validateRegisterRequest,
  validateLoginRequest,
  requireLogin,
  isRequestValidated,
} = require("../Validators/validation");
const multer = require("multer");
const ALLOWED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
];
const storage1 = multer.memoryStorage();

const upload = multer({
  storage1,
  fileFilter: function (req, file, cb) {
    if (ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Not supported file type!"), false);
    }
  },
});
router.post("/login", validateLoginRequest, isRequestValidated, loginUser);
router.post("/register", validateRegisterRequest, isRequestValidated, register);
router.post("/user/verify", verifyPhoneOtp);
router.post("/user/resend-otp", resendPhoneOtp);
router.post("/refresh-token", handleRefreshToken);
router.post("/user/logout", logout);
router.patch("/user/info", requireLogin, user_edit);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password", resetPassword);
router.post("/user/update-password", requireLogin, updatePassword);
router.patch(
  "/user/photo",
  requireLogin,
  upload.array("profilePicture"),
  user_photoUpload
);
//Delete User
router.delete("/user", requireLogin, deleteUserById);
//User Reviews
router.get("/user/reviews", requireLogin, getUserReviews);

//TO DO::
//Reset password
//Forgot password
//Send verfication code
//Verify verfication code

module.exports = router;
