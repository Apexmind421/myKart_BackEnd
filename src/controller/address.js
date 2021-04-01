const UserAddress = require("../models/address");
const address = require("../models/address");

exports.addAddress = (req, res) => {
  //return res.status(200).json({body: req.body})
  const { payload } = req.body;
  console.log("ADDRESS IS : " + JSON.stringify(req.body.address));
  if (req.body.address) {
    console.log("Inside Address If");
    if (req.body.address._id) {
      UserAddress.findOneAndUpdate(
        { user: req.user._id, "address._id": req.body.address._id },
        {
          $set: {
            "address.$": req.body.address,
          },
        }
      ).exec((error, address) => {
        if (error) return res.status(400).json({ error });
        if (address) {
          res.status(201).json({ address });
        }
      });
    } else {
      console.log("Inside Address If -> else");
      UserAddress.findOneAndUpdate(
        { user: req.user._id },
        {
          $push: {
            address: req.body.address,
          },
        },
        { new: true, upsert: true }
      ).exec((error, address) => {
        if (error) return res.status(400).json({ error });
        if (address) {
          res.status(201).json({ address });
        }
      });
    }
  } else {
    res.status(400).json({ error: "Params address required" });
  }
};

exports.getAddress = (req, res) => {
  UserAddress.findOne({ user: req.user._id }).exec((error, userAddress) => {
    if (error) return res.status(400).json({ error });
    if (userAddress) {
      res.status(200).json({ userAddress });
    }
  });
};

exports.deleteAddress = (req, res) => {
  const UserAddress = req.query.UserAddress;
  //console.log("WishList ID is " + wishlistId);
  if (UserAddress) {
    console.log("UserAddress ID is " + UserAddress);
    UserAddress.findOneAndDelete({ _id: UserAddress }).exec((error, result) => {
      if (error || !result) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ message: "UserAddress deleted sucessfully" });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};
