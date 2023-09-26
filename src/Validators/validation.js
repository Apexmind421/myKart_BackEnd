const { body, check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const shortid = require("shortid");
//const DataUri = require('datauri');
//const { uploader } = require('../config/cloudinary.config');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});
//const storage1 = multer.memoryStorage();

//const dUri = new DataUri();

//const multerUploads = multer({ storage1 }).array('images');
//exports.multerUploads = multerUploads;

//exports.multerUploads = multer({ storage1 }).array('images');

//const dataUri = req => (dUri.format(path.extname(req.originalname).toString(), req.buffer));
//exports.dataUri = dataUri;

exports.upload = multer({ storage });

exports.validateRegisterRequest = [
  //check("firstName").notEmpty().withMessage("First Name is required"),
  //check("lastName").notEmpty().withMessage("Last Name is required"),
  check("email").trim().isEmail().withMessage("Valid Email is required"),
  check("mobile")
    .trim()
    .isInt()
    .isLength({ min: 10, max: 10 })
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Valid Mobile is required"),
  check("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 charecters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
  check("passwordConfirmation")
    .trim()
    .custom(async (passwordConfirmation, { req }) => {
      const password = req.body.password;
      if (password !== passwordConfirmation) {
        throw new Error("Passwords must be same");
      }
    }),
];

exports.validateLoginRequest = [
  check("mobile")
    .trim()
    .isInt()
    .isLength({ min: 10, max: 10 })
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Valid Mobile is required"),
  check("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 charecters")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
];

exports.isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array()[0].msg,
    });
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
    return res.status(400).json({ status: "fail", message: "Require sign in" });
  }
  next();
};

exports.middleware = (req, res, next) => {
  // console.log(req.user.role);
  if (req.user.role !== "admin")
    return res.status(400).json({ status: "fail", message: "Access Denied" });
  next();
};

exports.createActivationLink = (obj, expiryTime) => {
  return jwt.sign(obj, process.env.ACTIVATION_SECRET, {
    expiresIn: expiryTime,
  });
};

exports.verifyActivationLink = (activation_token, expiryTime) => {
  return jwt.verify(activation_token, process.env.ACTIVATION_SECRET, {
    expiresIn: expiryTime,
  });
};

/*
exports._doMultipleUpload = (req) => {
  if (req.files) {
      const data = []
      for(let i=0;i< req.files.length;i++) {
         // const file = dataUri(req.files[i]).content
          const file = dUri.format(`${req.files[i].content.originalname}-${Date.now()}`, req.buffer)
          uploader.upload(file, (result) => {data.push(result.url)})         
      }
      return data     
  }
}
*/
