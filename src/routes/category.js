const express = require("express");
const router = express.Router();
const {
  addCategory,
  fetchCategory,
  fetchCategories,
  deleteCategories,
  modifyCategories,
} = require("../controller/category");
const { requireLogin, middleware } = require("../Validators/validation");
const shortid = require("shortid");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/category/add",
  requireLogin,
  middleware,
  upload.array("categoryImages"),
  addCategory
);

router.get("/category/fetch", fetchCategory);

router.get("/category/fetchcategories", fetchCategories);

router.post(
  "/category/modify",
  requireLogin,
  middleware,
  upload.array("categoryImages"),
  modifyCategories
);

router.post("/category/delete", requireLogin, middleware, deleteCategories);

module.exports = router;
