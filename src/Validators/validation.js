const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const shortid = require("shortid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

exports.upload = multer({ storage });

exports.validateRegisterRequest = [
  check("firstName").notEmpty().withMessage("First Name is required"),
  check("lastName").notEmpty().withMessage("Last Name is required"),
  check("email").isEmail().withMessage("Valid Email is required"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Must be at least 8 charecters")
    .matches(/\d/)
    .withMessage("must contain a number"),
];

exports.validateLoginRequest = [
  check("email").isEmail().withMessage("Valid Email is required"),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Must be at least 8 charecters")
    .matches(/\d/)
    .withMessage("must contain a number"),
];

exports.isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({ errors: errors.array()[0].msg });
    console.log("I am inside request validator");
  }
  next();
};

exports.requireLogin = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("User is " + JSON.stringify(user));
    req.user = user;
  } else {
    return res.status(400).json({ message: "Require sign in" });
  }
  next();
};

exports.middleware = (req, res, next) => {
  // console.log(req.user.role);
  if (req.user.role !== "admin")
    return res.status(400).json({ message: "Access Denied" });
  next();
};
