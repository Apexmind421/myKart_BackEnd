const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {
  register,
  login,
  user_edit,
  refreshToken,
  user_photoUpload,
} = require("../controller/auth");
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
router.post("/login", validateLoginRequest, isRequestValidated, login);

router.post("/register", validateRegisterRequest, isRequestValidated, register);

router.post("/refresh-token", refreshToken);

router.patch("/user/info", requireLogin, user_edit);

router.patch(
  "/user/photo",
  requireLogin,
  upload.array("profilePicture"),
  user_photoUpload
);
module.exports = router;
