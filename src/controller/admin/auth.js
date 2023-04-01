const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

module.exports.register = (req, res) => {
  User.findOne({ mobile: req.body.mobile }).exec(async (error, user) => {
    // console.log("I am inside  register 1");
    if (user)
      return res.status(400).json({
        message: "Admin already registered",
      });

    const { firstName, lastName, mobile, email, password } = req.body;
    const hash_password = await bcrypt.hash(password, 10);
    const _user = new User({
      firstName,
      lastName,
      email,
      mobile,
      hash_password,
      username: shortid.generate(),
      role: "admin",
    });

    _user.save((error, data) => {
      // console.log("I am inside  register 2");
      if (error) {
        // console.log("I am inside  register 3");
        return res.status(400).json({
          message: "Something went wrong" + error,
        });
      }

      if (data) {
        // console.log("I am inside  register 4");
        const token = jwt.sign(
          { _id: data._id, role: data.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        const { _id, firstName, lastName, email, mobile, role, fullName } =
          data;
        res.cookie("token", token, { expiresIn: "1d" });
        return res.status(201).json({
          token,
          user: {
            _id,
            firstName,
            lastName,
            email,
            mobile,
            role,
          },
          message: "Admin created Successfully..!",
        });
      }
    });
  });
};

module.exports.login = (req, res) => {
  User.findOne({ mobile: req.body.mobile }).exec(async (error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      const isPassword = await user.authenticate(req.body.password);
      if (isPassword && user.role === "admin") {
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        const { _id, firstName, lastName, email, mobile, role, fullName } =
          user;
        res.cookie("token", token, { expiresIn: "1d" });
        res.status(200).json({
          token,
          user: { _id, firstName, lastName, email, mobile, role, fullName },
        });
      } else {
        return res.status(400).json({
          message: "Invalid Password",
        });
      }
    } else {
      return res.status(400).json({ message: "Something went wrong" });
    }
  });
};

module.exports.requireLogin = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log(token);
  const user = jwt.verify(token, process.env.JWT_SECRET);
  req.user = user;
  next();
};

module.exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Signout successfully...!",
  });
};

module.exports.getAllUserList = (req, res) => {
  //Set Search Query
  let searchQuery = {};
  const { searchString } = req.query;
  if (searchString) {
    searchQuery = {
      $or: [
        { firstName: { $regex: searchString, $options: "i" } },
        {
          email: searchString,
        },
      ],
    };
  }
  const role = req.query.role ? req.query.role : "user";
  //Set exclude fields
  const excludeFields = { hash_password: 0, pushTokens: 0, __v: 0 };
  //Set Limit and offset
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const page = req.query.page ? Number(req.query.page) : 1;
  const offset = limit * (page - 1);
  //Set Sort order
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder === "name_ascending"
      ? { firstName: 1 }
      : req.query.sortOrder === "name_decending"
      ? { firstName: -1 }
      : req.query.sortOrder === "date_ascending"
      ? { createdAt: 1 }
      : { createdAt: -1 }
    : { firstName: -1 };

  User.find(
    {
      $and: [{ role: role }, searchQuery],
    },
    excludeFields
  )
    .sort(sortOrder)
    .skip(offset)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Users are not found" + err,
        });
      }
      res.status(200).json({
        size: data.length,
        data,
      });
    });
};

module.exports.user_edit = (req, res) => {
  const { id } = req.query;
  User.findOne({ _id: id }).exec((error, user) => {
    if (error) return res.status(400).json({ error });
    if (user) {
      if (req.body) {
        if (req.body.mobile) {
          user.mobile = req.body.mobile;
        }
        if (req.body.isBlocked) {
          user.isBlocked = req.body.isBlocked;
        }
        if (req.body.email) {
          user.email = req.body.email;
        }
        if (req.body.firstName) {
          user.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
          user.lastName = req.body.lastName;
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

module.exports.deleteUserById = (req, res) => {
  const { id } = req.query;
  // console.log(id);
  User.findOne({ _id: id }).exec((err, user) => {
    if (err) return res.status(400).json({ message: "User is not registered" });
    if (user) {
      User.deleteOne({ _id: id }).exec((error, result) => {
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
