const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

module.exports.register = (req, res) => {
  User.findOne({ email: req.body.email }).exec(async (error, user) => {
    if (user)
      return res.status(400).json({
        message: "User is already registered",
      });

    const { firstName, lastName, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      firstName,
      lastName,
      email,
      hash_password,
      username: shortid.generate(),
    });
    _user.save((error, data) => {
      if (error) {
        console.log(req.body);
        return res.status(400).json({
          message: "Something went wrong",
        });
      }
      if (data) {
        try {
          const token = jwt.sign(
            { _id: data._id, role: data.role },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
          );
          //console.log(data);
          //console.log("Token is "+token);
          return res.status(201).json({
            token,
            user: {
              firstName,
              lastName,
              email,
            },
            message: "User created successfully",
          });
        } catch (error) {
          //console.log(error+" has occured");
          return res.status(400).json({
            message: "Something went wrong",
          });
        }
      }
    });
    //const _user = new User({firstName:"Baba", lastName:"Rabbit", email:"abc.421@gmail.com", password: "password", username: Math.random().toString()});
    //_user.save();
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
        const { _id, firstName, lastName, email, role, fullName } = user;
        res.cookie("token", token, { expiresIn: "1d" });
        return res.status(200).json({
          token,
          user: {
            _id,
            firstName,
            lastName,
            email,
            role,
            fullName,
          },
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

exports.logout = (req, res) => {
  res.clearCookie("token");
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
