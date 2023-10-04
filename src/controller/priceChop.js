const User = require("../models/user");
const Product = require("../models/product");
const PriceChop = require("../models/priceChop");
module.exports.createPriceChop = async (req, res) => {
  try {
    const productId = req.query.product;
    let totalRequired = 10;
    if (productId) {
      //Validate if there are more than one PriceChops created by user in last 24 hours
      //Validate whether it is a valid product
      //Calculate totalRequired  from log(product.price)/log(x), where x is varaible.

      const validatePriceChops = await PriceChop.find({
        createdAt: { $gt: new Date() - 24 * 60 * 60 * 1000 },
        owner: req.user._id,
      });

      if (validatePriceChops && validatePriceChops.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Price Chop already exist" });
      }
      const isValidProduct = await Product.findById(productId).select(
        "_id price quanity"
      );
      if (isValidProduct) {
        const priceChop = await PriceChop.create({
          owner: req.user._id,
          product: req.query.product,
          totalRequired: totalRequired,
          currentRequired: totalRequired,
        });
        if (priceChop) {
          return res.status(201).json({
            success: true,
            mesage: "Price chop Created",
            data: priceChop._id,
          });
        } else {
          return res
            .status(400)
            .json({ success: false, message: "Could not create price chop" });
        }
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product" });
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

//For user to accept the PriceDrop
module.exports.updatePriceChop = async (req, res) => {
  try {
    const id = req.query.id;
    const isValidChop = "true";
    const args = {};
    if (id) {
      //Validate if priceChop is Open and created in last 24 hours.
      //Validate if user has already accepted the priceChop.
      //Validate if user has accepted more than 3 priceChops in last 24 hours.

      const validatePriceChops = await PriceChop.findById(id).select(
        "totalRequired currentRequired status owner members createdAt"
      );

      if (validatePriceChops) {
        //Check if user has already chopped the price
        const alreadyMember = validatePriceChops.members.findIndex(
          (x) => x == req.user._id
        );
        if (alreadyMember < 0) {
          args = {
            $push: {
              members: req.user._id,
            },
          };
        } else {
          isValidChop = "false";
        }
        //Check if the chop is expired
        if (createdAt < Date.now() - 24 * 60 * 60 * 1000) {
          args = { status: "Cancelled" };
          isValidChop = "false";
        }
        if (isValidChop == "true" && validatePriceChops.currentRequired < 1) {
          isValidChop = "false";
        }
        if (isValidChop == "true" && validatePriceChops.currentRequired < 2) {
          args = { ...args, status: "Closed" };
        }

        //Check if user chopped more than 3 times.
        const checkAcceptedPriceChops = await PriceChop.find({
          members: req.user._id,
          createdAt: { $gt: new Date() - 24 * 60 * 60 * 1000 },
        });

        if (checkAcceptedPriceChops && checkAcceptedPriceChops.length < 3) {
          isValidChop = "true";
        } else {
          isValidChop = "false";
        }

        if (isValidChop == "true") {
          PriceChop.findByIdAndUpdate(id, {
            ...args,
            $inc: { currentRequired: -1 },
          }).exec((error, priceChop) => {
            if (error) {
              return res.status(500).json({ message: "Something went wrong" });
            }
            if (priceChop) {
              return res.status(200).json({ message: "Success", priceChop });
            } else {
              return res.status(400).json({ message: "Validation failed" });
            }
          });
        } else {
          return res.status(400).json({ message: "Price Chop is not valid" });
        }
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid price chop" });
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
