const UserAddress = require("../models/address");
const address = require("../models/address");
const zipCode = require("../models/zipCode");

exports.addAddress = (req, res) => {
  //return res.status(200).json({body: req.body})
  try {
    const { addressId, defaultAddressId } = req.query;
    if (req.body.address) {
      const addressObj = {
        $push: {
          address: req.body.address,
        },
      };
      UserAddress.findOneAndUpdate({ user: req.user._id }, addressObj, {
        new: true,
        upsert: true,
      })
        .populate({
          path: "address.zipCode",
          select: ["zipCode", "city", "district", "state"],
        })
        .exec((error, userAddress) => {
          if (error) return res.status(400).json({ error });
          if (userAddress) {
            const size = userAddress.address.length;
            res
              .status(201)
              .json({ userAddresses: userAddress.address[size - 1] });
          }
        });
    } else {
      return res.status(400).json({ message: "Missing input" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.addAddress1 = (req, res) => {
  //return res.status(200).json({body: req.body})
  const { payload } = req.body;
  const { addressId, defaultAddressId } = req.query;
  console.log("ADDRESS IS : " + JSON.stringify(req.body.address));
  if (req.body.address) {
    if (addressId) {
      const addressObj = /*defaultAddressId
        ? {
            defaultAddress: defaultAddressId,
            $set: {
              "address.$": req.body.address,
            },
          }
        : */ {
        $set: {
          "address.$": req.body.address,
        },
      };
      UserAddress.findOneAndUpdate(
        { user: req.user._id, "address._id": addressId },
        addressObj,
        { new: true }
      )
        .populate({
          path: "address.zipCode",
          select: ["zipCode", "city", "district", "state"],
        })
        .exec((error, userAddress) => {
          if (error) return res.status(400).json({ error });
          if (userAddress) {
            res.status(201).json({ userAddress });
          }
        });
    } else {
      console.log("Inside Address If -> else");
      const addressObj = {
        $push: {
          address: req.body.address,
        },
      };
      UserAddress.findOneAndUpdate({ user: req.user._id }, addressObj, {
        new: true,
        upsert: true,
      })
        .populate({
          path: "address.zipCode",
          select: ["zipCode", "city", "district", "state"],
        })
        .exec((error, userAddress) => {
          if (error) return res.status(400).json({ error });
          if (userAddress) {
            res.status(201).json({ userAddresses: userAddress.address });
          }
        });
    }
  } else {
    res.status(400).json({ error: "Params address required" });
  }
};

exports.getAddress = (req, res) => {
  console.log("I am here inside getAddress");
  const excludeFields = { _id: 0, user: 0, __v: 0, createdAt: 0, updatedAt: 0 };
  UserAddress.findOne({ user: req.user._id }, excludeFields)
    /*  .populate("address.zipCode")
    .exec((error, userAddress) => {
      if (error) return res.status(400).json({ error });
      if (userAddress) {
        return res.status(200).json({ userAddresses: userAddress });
      } else {
        return res.status(200).json({ userAddresses: [] });
      }
    });*/
    //  .populate("address.zipCode")
    .populate({
      path: "address.zipCode",
      select: ["zipCode", "city", "district", "state"],
    })
    .exec((error, userAddress) => {
      if (error) return res.status(400).json({ error });
      if (userAddress) {
        return res.status(200).json({ userAddresses: userAddress });
      } else {
        return res.status(200).json({ userAddresses: [] });
      }
    });
};

exports.deleteAddress = (req, res) => {
  const UserAddressID = req.query.UserAddress;
  if (UserAddressID) {
    UserAddress.findOneAndUpdate(
      { user: req.user._id, "address._id": UserAddressID },
      {
        $pull: {
          address: {
            _id: UserAddressID,
          },
        },
      },
      { new: true }
    )
      .populate({
        path: "address.zipCode",
        select: ["zipCode", "city", "district", "state"],
      })
      .exec((error, result) => {
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
        res.status(202).json({ message: "updated sucessfully" });
      }
    });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};

exports.getZipCodes = (req, res) => {
  zipCode
    .find()
    //findOne({ user: req.user._id })
    .exec((error, zipCodes) => {
      if (error) return res.status(400).json({ error });
      if (zipCodes) {
        return res.status(200).json({ zipCodes });
      } else {
        return res.status(200).json({});
      }
    });
};

exports.addZipCodes = (req, res) => {
  if (req.body.zipCode) {
    const Code = new zipCode(req.body);
    Code.save((error, zipCode) => {
      if (error) return res.status(400).json({ error });
      if (zipCode) return res.status(201).json({ zipCode });
    });
  } else {
    return res.status(400).json({ message: "Please provide zipCode" });
  }
};

exports.setDefaultAddress = (req, res) => {
  const defaultAddressId = req.query.addressId;
  if (defaultAddressId) {
    const setDefaultAddress = UserAddress.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        $set: { defaultAddress: defaultAddressId },
      }
    );

    return res.status(202).json({ result: "updated default address" });
  } else {
    res.status(400).json({ error: "Params required" });
  }
};
