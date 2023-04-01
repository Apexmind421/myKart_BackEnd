const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const DatauriParser = require("datauri/parser");
const path = require("path");
const parser = new DatauriParser();
const { uploader } = require("../config/cloudinary.config");

module.exports.register = (req, res) => {
  User.findOne({ mobile: req.body.mobile }).exec(async (error, user) => {
    //In case of any error in searching user send error.
    if (error)
      return res.status(400).json({
        status: "fail",
        message: "Something went wrong",
      });
    //If user is already exist send error
    if (user) {
      return res.status(401).json({
        status: "fail",
        message: "User is already registered",
      });
    }
    //If user is not exist, create user
    else {
      const { email, mobile, password } = req.body;
      const hash_password = await bcrypt.hash(password, 10);
      const _user = new User({
        email,
        mobile,
        hash_password,
        username: shortid.generate(),
      });
      _user.save((error, data) => {
        //send error in case of any error in user creation.
        if (error) {
          return res.status(400).json({
            status: "fail",
            message: "Something went wrong" + error,
          });
        }

        if (data) {
          console.log("test3");
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
            isMobileVerified,
            referral_code,
            isBlocked,
            balance,
          } = data;
          return res.status(201).json({
            status: "success",
            message: "User created successfully",
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
              isMobileVerified,
              referral_code,
              isBlocked,
              balance,
            },
            expireTime: Date.now() + 60 * 60 * 1000,
          });
        }
      });
    }
  });
};

module.exports.login = (req, res) => {
  User.findOne({ mobile: req.body.mobile }).exec((error, user) => {
    if (error)
      return res.status(400).json({
        message: "Something went wrong",
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
          isMobileVerified,
          referral_code,
          isBlocked,
          balance,
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
            isMobileVerified,
            referral_code,
            isBlocked,
            balance,
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
        message: "User is not registered",
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
    //console.log("XXX 1 is " + JSON.stringify(user));
    if (error) return res.status(400).json({ error });
    if (user) {
      //console.log("XXX is " + JSON.stringify(user));
      if (req.body) {
        if (req.body.firstName) {
          user.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
          user.lastName = req.body.lastName;
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
              mobile,
              username,
              isMobileVerified,
            } = _user;
            return res.status(200).json({
              user: {
                _id,
                firstName,
                lastName,
                email,
                role,
                username,
                mobile,
                profilePicture,
                isMobileVerified,
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
  let userProfileImage;
  if (req.files && req.files.length > 0) {
    const prodFile = parser.format(
      path.extname(req.files[0].originalname).toString(),
      req.files[0].buffer
    );
    const uploadResult = await uploader.upload(prodFile.content);
    userProfileImage = uploadResult.secure_url;
    if (userProfileImage) {
      User.findOne({ _id: req.user._id }).exec((error, user) => {
        if (error) return res.status(400).json({ error });
        if (user) {
          user.profilePicture = userProfileImage;
          user.save((err, _user) => {
            if (err) {
              return res.status(400).json({
                message: "Something went wrong",
              });
            }
            if (_user) {
              const { _id, profilePicture } = _user;
              return res.status(200).json({
                status: "success",
                user: {
                  _id,
                  profilePicture,
                },
              });
            }
          });
        } else {
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

module.exports.deleteUserById = (req, res) => {
  User.findOne({ _id: req.user._id }).exec((err, user) => {
    if (err) return res.status(400).json({ message: "User is not registered" });
    if (user) {
      User.deleteOne({ _id: req.user._id }).exec((error, result) => {
        if (error) return res.status(400).json({ message: "fail", error });
        if (result) {
          res.status(202).json({ message: "success", result });
        }
      });
    } else {
      return res.status(400).json({
        message: "Something went wrong",
      });
    }
  });
};
