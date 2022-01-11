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
        },
        { new: true }
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
  console.log('I am here inside getAddress');
  UserAddress.findOne({ user: req.user._id }).exec((error, userAddress) => {
    if (error) return res.status(400).json({ error });
    if (userAddress) {
     return res.status(200).json({ userAddress });
    } else {
      return res.status(200).json({});
    }
  });
};


exports.deleteAddress = (req, res) => {
  const UserAddressID = req.query.UserAddress;
  if (UserAddressID) {
    UserAddress.findOneAndUpdate(
      { user: req.user._id,"address._id": UserAddressID},
      {
        $pull: {
          address: {
            _id: UserAddressID,
          },
        },
      },
      {new: true}
    ).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  }
};

exports.modifyAddress = (req, res) => {
  const UserAddressID = req.body.address._id;
  console.log("UserAddress ID is " + JSON.stringify(req.body.address.name));
  if (UserAddressID) {
    UserAddress.findOneAndUpdate(
      { user: req.user._id, "address._id": req.body.address._id },
      {
        $set: {
          "address.$": req.body.address,
        },
      },
      { new: true }
    ).exec((error, result) => {
      if (error) return res.status(400).json({ error: error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};
