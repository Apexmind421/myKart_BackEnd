const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const DatauriParser = require("datauri/parser");
const path = require("path");
const parser = new DatauriParser();
const { uploader } = require("../config/cloudinary.config");

module.exports.register = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (error)
      return res.status(400).json({
        message: "User is not registered",
      });
    if (user) {
      console.log("I am in user" + JSON.stringify(user));
      return res.status(401).json({
        message: "User is already registered",
      });
    } else {
      const { email, password } = req.body;
      const hash_password = await bcrypt.hash(password, 10);
      const _user = new User({
        email,
        hash_password,
        username: shortid.generate(),
      });
      console.log("Data is " + JSON.stringify(_user));
      _user.save((error, data) => {
        console.log("Data is " + JSON.stringify(data));
        if (error) {
          console.log("Error is " + JSON.stringify(error));
          return res.status(400).json({
            message: "Something went wrong",
          });
        }
        if (data) {
          const token = jwt.sign(
            { _id: data._id, role: data.role },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
          );
          const refreshtoken = jwt.sign(
            { _id: data._id, role: data.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "3w" }
          );
          const {
            _id,
            firstName,
            lastName,
            email,
            role,
            profilePicture,
            contactNumber,
            username,
            isEmailVerified,
          } = data;
          return res.status(201).json({
            token,
            refreshtoken,
            user: {
              _id,
              firstName,
              lastName,
              email,
              role,
              username,
              contactNumber,
              profilePicture,
              isEmailVerified,
            },
            expireTime: Date.now() + 60 * 60 * 1000,
            message: "User created successfully",
          });
        }
      });
    }
  });
};

module.exports.login = (req, res) => {
  User.findOne({ email: req.body.email }).exec((error, user) => {
    if (error)
      return res.status(400).json({
        message: "User is not registered",
      });
    if (user) {
      if (user.authenticate(req.body.password)) {
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "3h" }
        );
        const refreshtoken = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "3w" }
        );
        const {
          _id,
          firstName,
          lastName,
          email,
          role,
          profilePicture,
          contactNumber,
          username,
          isEmailVerified,
        } = user;
        res.cookie("token", token, { expiresIn: "1d" });
        return res.status(200).json({
          token,
          refreshtoken,
          user: {
            _id,
            firstName,
            lastName,
            email,
            role,
            username,
            contactNumber,
            profilePicture,
            isEmailVerified,
          },
          expireTime: Date.now() + 60 * 60 * 1000,
          message: "User exists",
        });
      } else {
        return res.status(400).json({
          message: "Invalid Password",
        });
      }
    } else {
      return res.status(400).json({
        message: "Something went wrong",
      });
    }
  });
};

module.exports.refreshToken = (req, res, next) => {
  const refreshtoken = req.body.refreshToken;
  jwt.verify(
    refreshtoken,
    process.env.REFRESH_TOKEN_SECRET,
    function (err, user) {
      if (err) {
        res.status(400).json({ err });
      } else {
        let token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "3h" }
        );
        let refreshToken = req.body.refreshToken;
        res.status(200).json({
          message: "Token refreshed sucessfully",
          token,
          refreshToken,
        });
      }
    }
  );
};

module.exports.user_edit = (req, res) => {
  // const { id } = req.params;

  User.findOne({ _id: req.user._id }).exec((error, user) => {
    console.log("XXX 1 is " + JSON.stringify(user));
    if (error) return res.status(400).json({ error });
    if (user) {
      console.log("XXX is " + JSON.stringify(user));
      if (req.body) {
        if (req.body.firstName) {
          user.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
          user.lastName = req.body.lastName;
        }
        if (req.body.isEmailVerified) {
          user.isEmailVerified = req.body.isEmailVerified;
        }
        if (req.body.contactNumber) {
          user.contactNumber = req.body.contactNumber;
          console.log("XXX is " + JSON.stringify(req.body.contactNumber));
        }
        if (req.body.email) {
          user.email = req.body.email;
        }
        user.save((err, _user) => {
          if (err) {
            return res.status(400).json({
              message: "Something went wrong",
            });
          }

          if (_user) {
            const {
              _id,
              firstName,
              lastName,
              email,
              role,
              profilePicture,
              contactNumber,
              username,
              isEmailVerified,
            } = _user;
            return res.status(200).json({
              user: {
                _id,
                firstName,
                lastName,
                email,
                role,
                username,
                contactNumber,
                profilePicture,
                isEmailVerified,
              },
            });
          }
        });
      }
    } else {
      return res.status(400).json({
        message: "Something went wrong",
      });
    }
  });
};

module.exports.user_photoUpload = async (req, res) => {
  //const host = process.env.HOST_NAME;
  //  const { id } = req.params;
  const id = req.query.id;
  console.log("I am in 0");
  let userProfileImage;
  if (req.files && req.files.length > 0) {
    console.log("I am in 1" + req.user._id);
    const prodFile = parser.format(
      path.extname(req.files[0].originalname).toString(),
      req.files[0].buffer
    );
    const uploadResult = await uploader.upload(prodFile.content);
    userProfileImage = uploadResult.secure_url;
    if (userProfileImage) {
      console.log("I am in 1.5");
      User.findOne({ _id: req.user._id }).exec((error, user) => {
        if (error) return res.status(400).json({ error });
        if (user) {
          console.log("I am in 2");
          user.profilePicture = userProfileImage;
          user.save((err, _user) => {
            console.log("I am in 2.5");
            if (err) {
              console.log("I am in 3" + JSON.stringify(err));
              return res.status(400).json({
                message: "Something went wrong",
              });
            }
            if (_user) {
              console.log("I am in 3.5");
              const {
                _id,
                firstName,
                lastName,
                email,
                role,
                profilePicture,
                contactNumber,
                username,
                isEmailVerified,
              } = _user;
              return res.status(200).json({
                user: {
                  _id,
                  firstName,
                  lastName,
                  email,
                  role,
                  username,
                  contactNumber,
                  profilePicture,
                  isEmailVerified,
                },
              });
            }
          });
        } else {
          console.log("I am in 4.0");
          return res.status(400).json({
            message: "Something went wrong",
          });
        }
      });
    }
  }
};

const user_resetpw = async (req, res) => {
  const email = req.body.email.toLowerCase();
  if (!email) {
    return res.status(400).send({ err: "Email is wrong" });
  }
  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    res.status(404).send({ err: "Email is not exist" });
  }
  const token = usePasswordHashToMakeToken(user);
  const url = getPasswordResetURL(user, token);
  const emailTemplate = resetPasswordTemplate(user, url);
  const sendEmail = () => {
    transporter.sendMail(emailTemplate, (err, info) => {
      if (err) {
        res.status(500).send({ err: "Error sending email" });
      } else {
        console.log(`** Email sent **`, info);
        res.send({ res: "Sent reset Email" });
      }
    });
  };

  sendEmail();
};
const user_receivepw = async (req, res) => {
  const { userId, token } = req.params;
  const { password } = req.body;
  let content = {
    title: "Security",
    body: `Reset Password Successfully.`,
  };
  // highlight-start
  const user = await User.findOne({ _id: userId });
  if (!user) {
    res.status(404).send({ err: "Invalid user" });
  }
  const secret = user.password + "-" + user.createdAt;
  const payload = jwt.decode(token, secret);
  console.log(payload);
  if (payload._id === userId) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    try {
      const updateUser = await User.findOneAndUpdate(
        { _id: userId },
        { password: hashedPassword }
      );
      pushNotification(updateUser.pushTokens, content, ""),
        res.status(202).send("Password is changed");
    } catch (err) {
      res.status(500).send({ err });
    }
  } else {
    res.status(500).send({ err: "Token is invalid" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshtoken");
  res.status(200).json({
    message: "Signout successfully...!",
  });
};

module.exports.requireLogin = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log(token);
  const user = jwt.verify(token, process.env.JWT_SECRET);
  req.user = user;
  next();
};
