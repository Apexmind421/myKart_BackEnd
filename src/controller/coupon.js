const Coupon = require("../models/coupon");
const Product = require("../models/product");
//const validateMongoDbId = require("../Validators/validateMongodbId");

exports.addCouponCode = async (req, res) => {
  try {
    const {
      code,
      type,
      discount,
      isPercent,
      start_date,
      end_date,
      min_buy,
      max_discount,
    } = req.body;

    let couponObj = {};
    //Check if coupon is already exist.
    const validCoupon = await Coupon.findOne({
      code: coupon.trim().toUpperCase(),
    });

    if (validCoupon != null) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exist" });
    }

    if (isPercent) {
      if (discount > 100) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon discount should not be more than 100 for percentage discount type",
        });
      }
    }
    couponObj.code = code.toUpperCase();
    couponObj.type = type;
    couponObj.start_date = new Date(start_date);
    couponObj.end_date = new Date(end_date);
    couponObj.discount = discount;
    couponObj.isPercent = isPercent;
    couponObj.products = [];

    if (type == "product") {
      for (i in req.body.products) {
        couponObj.products.push(req.body.products[i]);
      }
    } else if (type == "total") {
      couponObj.min_buy = min_buy;
      couponObj.max_discount = max_discount;
    }

    const coupon = await Coupon.create(couponObj);
    return res.status(201).json({
      success: true,
      message: "Coupon has been created",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.updateCouponCode = async (req, res) => {
  try {
    const { id } = req.query;
    /*
    //Check if coupon is already exist.
    const validCoupon = await Coupon.findById(id);

    if (validCoupon === null || !validCoupon) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Coupon" });
    }
    */
    const {
      type,
      isActive,
      discount,
      start_date,
      end_date,
      isPercent,
      min_buy,
      max_discount,
    } = req.body;

    let couponObj = {};

    couponObj.type = type;
    if (start_date) couponObj.start_date = new Date(start_date);
    if (end_date) couponObj.end_date = new Date(end_date);
    couponObj.discount = discount;
    couponObj.isPercent = isPercent;
    couponObj.isActive = isActive;

    if (type == "product") {
      couponObj.products = [];
      for (i in req.body.products) {
        couponObj.products.push(req.body.products[i]);
      }
    } else if (type == "total") {
      couponObj.min_buy = min_buy;
      couponObj.max_discount = max_discount;
    }

    const coupon = await Coupon.findByIdAndUpdate(id, couponObj, { new: true });
    return res.status(201).json({
      success: true,
      message: "Coupon has been updated",
      data: coupon,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.fetchCouponCode = (req, res) => {
  Coupon.findOne({
    code: req.query.code,
    isActive: true,
    start_date: { $lt: new Date() },
    end_date: { $gt: new Date() },
  }).exec((err, result) => {
    if (err)
      return res.status(500).send({
        success: false,
        message: "Something went wrong",
        error: err.message,
      });
    if (result)
      return res
        .status(200)
        .send({ success: true, message: "Coupon has been fetched", result });
    else
      return res
        .status(400)
        .send({ success: false, message: "Invalid Coupon" });
  });
};

exports.fetchAllCouponCodes = async (req, res) => {
  try {
    const result = await Coupon.find();
    if (result) {
      return res.status(200).json({
        success: true,
        message: "fetched all coupons",
        data: result,
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

exports.deleteCouponCode = async (req, res) => {
  try {
    const { id } = req.params;
    //validateMongoDbId(id);
    if (id) {
      const result = await Coupon.findByIdAndDelete(id);

      if (result) {
        return res
          .status(202)
          .json({ success: true, message: "Coupon removed" });
      } else {
        return res.status(400).json({
          success: false,
          message: "Could not remove the Coupon",
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
exports.deleteAllCouponCodes = (req, res) => {
  Coupon.deleteMany().exec((error, result) => {
    if (error) return res.status(400).json({ error });
    if (result) {
      res.status(202).json({ result });
    }
  });
};
