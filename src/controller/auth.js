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
  } catch (error) {
    return res.status(400).json({
      type: "Error",
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//Login User
module.exports.loginUser = async (req, res) => {
  //TO DO: Add email OTP
  try {
    const { mobile, password } = req.body;
    const findUser = await User.findOne({ mobile });
    console.log("xxx");
    if (findUser && (await findUser.authenticate(password))) {
      if (findUser.isBlocked) {
        //TO DO:Try to add to Login attempts table
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
  User.findById(req.user._id).exec((error, user) => {
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
      User.findById( req.user._id ).exec((error, user) => {
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

module.exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const id = req.user._id;
    //let user = await User.findById(_id);
    if (password) {
      const hashPassword = await bcrypt.hash(password, 10);
      // user.hash_password = hashpassword;
      // const updatedPassword = await user.save();
      console.log("xxx " + req.user._id);
      const updatedPassword = await User.findByIdAndUpdate(
        id,
        { hash_password: hashPassword },
        { new: true }
      );
      if (updatedPassword) {
        //TO DO: To send the email after password has been changed.
        return res.status(200).json({
          type: "Success",
          message: "successfully updated the password",
        });
      } else {
        return res.status(400).json({
          type: "Error",
          message: "Error in updating the password",
        });
      }
    } else {
      return res.status(400).json({
        type: "Error",
        message: "missing the password",
        user: req.user,
      });
    }
  } catch (error) {
    return res.status(500).json({
      type: "Error",
      message: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // 1)Check if the user exist with the email
    const findUser = await User.findOne({ email: email });
    if (!findUser)  return res.status(400).json({
      type: "Error",
      message: "User not found with this email"   });

    // 2) Generate reset password token
    //TO DO: Use Hashing the token
    const resetPasswordToken = await generateResetPasswordToken(findUser?._id);

    // 3) Update user record with reset password token and its expiration
    await User.findByIdAndUpdate(
      findUser._id,
      {
        passwordResetToken: resetPasswordToken,
        tokenExpires: Date.now() + 5 * 60 * 1000, //5 mins
      },
      { new: true }
    );
    // 4) Sending reset link to user email
    const resetPasswordUrl = `/reset-password?token=${resetPasswordToken}`;

    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='${resetPasswordUrl}'>Click Here</>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    // sendEmail(data);

    // 5) If everything is OK, send data
    return res.status(200).json({
      type: "Success",
      message: "successfully sent the password reset Link",
      resetPasswordToken, //TO DO: TO remove
    });
  } catch (error) {
    return res.status(400).json({
      type: "Error",
      message: "Something went wrong",
    });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const resetPasswordToken = req.query.token;
    //const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      tokenExpires: { $gt: Date.now() },
    });
    console.log("xxx" + resetPasswordToken);
    if (!user) {
      return res.status(400).json({
        type: "Error",
        message: " Token Expired, Please try again later",
      });
    }
    const hash_password = await bcrypt.hash(password, 10);
    user.hash_password = hash_password;
    user.passwordResetToken = undefined;
    user.tokenExpires = undefined;
    await user.save();
    //TO DO:Sending after reset password mail
    return res.status(200).json({
      type: "Success",
      message: "successfully Reset the password",
      user, //TO DO: Update the user object to send only few fileds
    });
  } catch (error) {
    return res.status(400).json({
      type: "Error",
      message: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const refresh_token = req.body.refreshToken; //TO DO: Take it from cookie
    if (!refresh_token) {
      return res
        .status(400)
        .json({ status: "Error", messgae: "No referesh token is request" });
    }
    const findUser = await User.find({ refreshToken: refresh_token });
    const updatedUser = await User.findByIdAndUpdate(findUser._id, {
      refreshToken: null,
    }).exec();
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
    });
    res.clearCookie("refreshtoken", {
      httpOnly: true,
      secure: true,
    });
    return res
      .status(200)
      .json({ type: "Success", message: "Signout successfully...!" });
  } catch (error) {
    return res.status(400).json({
      type: "Error",
      message: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports.requireLogin = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
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

module.exports.verifyPhoneOtp5 = async (req, res, next) => {
  try {
    const { otp, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      next({ status: 400, message: USER_NOT_FOUND_ERR });
      return;
    }

    if (user.phoneOtp !== otp) {
      next({ status: 400, message: INCORRECT_OTP_ERR });
      return;
    }
    const token = createJwtToken({ userId: user._id });

    user.phoneOtp = "";
    await user.save();

    res.status(201).json({
      type: "success",
      message: "OTP verified successfully",
      data: {
        token,
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports.register5 = (req, res) => {
  try {
    User.findOne({ mobile: req.body.mobile }).exec(async (error, user) => {
      //In case of any error in searching user send error.
      if (error)
        return res.status(400).json({
          type: "Error",
          message: "Something went wrong",
        });
      //If user is already exist send error
      if (user) {
        return res.status(401).json({
          type: "Error",
          message: "User is already registered",
        });
      }
      //If user is not exist, create user
      else {
        const { email, mobile, password, referralCode, referredBy } = req.body;
        const hash_password = await bcrypt.hash(password, 10);
        const _user = await User.create({
          email,
          mobile,
          referralCode,
          referredBy,
          hash_password,
          username: shortid.generate(),
        });
        _user.hash_password = undefined;

        const tokens = await generateAuthTokens(_user);
        return res.status(201).json({
          type: "Success",
          message: "User created successfully",
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: _user,
          expireTime: Date.now() + 60 * 60 * 1000,
        });
        /* const _user = new User({
        email,
        mobile,
        referralCode,
        referredBy,
        hash_password,
        username: shortid.generate(),
      });
      _user.save((error, data) => {
        //send error in case of any error in user creation.
        if (error) {
          return res.status(400).json({
            type: "Error",
            message: "Something went wrong " + error,
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
            mobile,
            username,
            isMobileVerified,
            referralCode,
            referredBy,
            isBlocked,
            balance,
          } = data;
          return res.status(201).json({
            type: "Success",
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
              mobile,
              profilePicture,
              isMobileVerified,
              referralCode,
              referredBy,
              isBlocked,
              balance,
            },
            expireTime: Date.now() + 60 * 60 * 1000,
          });
        }
      });*/
      }
    });
  } catch (error) {
    return res.status(400).json({
      type: "Error",
      message: "Something went wrong",
    });
  }
};
/*
module.exports.login5 = (req, res) => {
  User.findOne({ mobile: req.body.mobile }).exec((error, user) => {
    if (error)
      return res.status(400).json({
        message: "Something went wrong",
        type: "Error",
      });
    if (user) {
      if (user.isBlocked) {
        return res.status(400).json({
          message: "User account is blocked",
          type: "Error",
        });
      }
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
          mobile,
          username,
          isMobileVerified,
          referralCode,
          wiseCoins,
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
            mobile,
            profilePicture,
            isMobileVerified,
            referralCode,
            wiseCoins,
            isBlocked,
            balance,
          },
          expireTime: Date.now() + 60 * 60 * 1000,
          message: "User exists",
          type: "Success",
        });
      } else {
        return res.status(400).json({
          type: "Error",
          message: "Invalid Password",
        });
      }
    } else {
      return res.status(400).json({
        type: "Error",
        message: "User is not registered",
      });
    }
  });

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
