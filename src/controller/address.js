const UserAddress = require("../models/address");
const address = require("../models/address");
const zipCode = require("../models/zipCode");

exports.addAddress = async (req, res) => {
  //return res.status(200).json({body: req.body})
  try {
    //const { addressId, defaultAddressId } = req.query;

    //Check if address is been provided
    if (req.body.address) {
      //Update user address with new address
      const userAddress = await UserAddress.findOneAndUpdate(
        { user: req.user._id },
        {
          $push: {
            address: req.body.address,
          },
        },
        {
          new: true,
          upsert: true,
        }
      ).populate({
        path: "address.zipCode",
        select: ["zipCode", "city", "district", "state"],
      });

      if (userAddress) {
        const size = userAddress.address.length;
        return res.status(201).json({
          success: true,
          message: "added user address",
          data: userAddress.address[size - 1],
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "could not create user address" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const excludeFields = {
      _id: 0,
      user: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    };
    const userAddress = await UserAddress.findOne(
      { user: req.user._id },
      excludeFields
    ).populate({
      path: "address.zipCode",
      select: ["zipCode", "city", "district", "state"],
    });

    if (userAddress) {
      return res.status(200).json({
        success: true,
        message: "fetched user address",
        data: userAddress,
      });
    } else {
      return res
        .status(204)
        .json({ success: true, message: "No result found", data: [] });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const UserAddressID = req.query.UserAddress;
    if (UserAddressID) {
      const result = await UserAddress.findOneAndUpdate(
        { user: req.user._id, "address._id": UserAddressID },
        {
          $pull: {
            address: {
              _id: UserAddressID,
            },
          },
        }
      ).populate({
        path: "address.zipCode",
        select: ["zipCode", "city", "district", "state"],
      });

      //TO DO: only select defaultAddress

      if (result) {
        //If the address is default address, reset it
        if (result.defaultAddress == UserAddressID) {
          const updateDefaultAddress = await UserAddress.findOneAndUpdate(
            { user: req.user._id },
            {
              defaultAddress: null,
            }
          );
        }
        return res
          .status(202)
          .json({ success: true, message: "deleted user address" });
      } else {
        return res.status(400).json({
          success: false,
          message: "Could not delete address",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.modifyAddress = async (req, res) => {
  try {
    const UserAddressID = req.body.address._id;
    if (UserAddressID) {
      const userAddress = await UserAddress.findOneAndUpdate(
        { user: req.user._id, "address._id": req.body.address._id },
        {
          $set: {
            "address.$": req.body.address,
          },
        },
        { new: true }
      );
      if (userAddress) {
        return res
          .status(202)
          .json({ success: true, message: "updated sucessfully" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "could not update user address" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.getZipCodes = async (req, res) => {
  try {
    const zipCodes = await zipCode.find();
    if (zipCodes) {
      return res
        .status(200)
        .json({ success: true, message: "fetched zip codes", data: zipCodes });
    } else {
      return res
        .status(204)
        .json({ success: true, message: "No result found", data: [] });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.addZipCodes = async (req, res) => {
  try {
    if (req.body.zipCode) {
      const zip_code = await zipCode.create(req.body);
      if (zip_code)
        return res.status(201).json({
          success: true,
          message: "added zip code",
          data: zip_code,
        });
      else {
        return res
          .status(400)
          .json({ success: false, message: "could not create zip code" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Please provide zipCode" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const defaultAddressId = req.query.addressId;
    if (defaultAddressId) {
      const userAddress = await UserAddress.findOneAndUpdate(
        { user: req.user._id },
        {
          defaultAddress: defaultAddressId,
        },
        {
          new: true,
          upsert: true,
        }
      );
      if (userAddress) {
        return res.status(202).json({
          success: true,
          message: "updated default address",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "could not set user default address",
        });
      }
    } else {
      return res.status(400).json({ success: false, message: "Missing input" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/*
exports.addAddress1 = (req, res) => {
  //return res.status(200).json({body: req.body})
  const { payload } = req.body;
  const { addressId, defaultAddressId } = req.query;
  console.log("ADDRESS IS : " + JSON.stringify(req.body.address));
  if (req.body.address) {
    if (addressId) {
      const addressObj = {
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


exports.setDefaultAddress = (req, res) => {
const defaultAddressId = req.query.addressId;

if (defaultAddressId) {
  const setDefaultAddress = UserAddress.findOneAndUpdate(
    {
      user: req.user._id,
    },
    {
      defaultAddress: defaultAddressId,
    },
    {
      upsert: true,
    }
  );

  return res.status(202).json({ result: "updated default address" });
} else {
  res.status(400).json({ error: "Params required" });
}
};
*/
