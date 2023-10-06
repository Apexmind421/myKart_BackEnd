const express = require("express");
const router = express.Router();
const {
  addCategory,
  // fetchCategory,
  fetchCategories,
  deleteCategories,
  modifyCategories,
} = require("../controller/category");
const { requireLogin, middleware } = require("../Validators/validation");
const shortid = require("shortid");
const path = require("path");
const multer = require("multer");
const {
  flashSaleImgResize,
  uploadImage,
} = require("../middlewares/uploadImage");
const ALLOWED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
];
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

//const upload = multer({ storage });
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

/*******************
Routes
********************/

router.post(
  "/add",
  requireLogin,
  middleware,
  uploadImage.array("categoryImage"),
  //uploadImage.array("banner"),
  //upload.array("categoryImage"),
  addCategory
);
//router.get("/category/fetch", fetchCategory);
router.get("/fetch", fetchCategories);
router.post(
  "/modify",
  requireLogin,
  middleware,
  uploadImage.array("categoryImage"),
  modifyCategories
);
router.delete("/delete", requireLogin, middleware, deleteCategories);

module.exports = router;
