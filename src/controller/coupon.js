const Coupon = require("../models/coupon");
const Product = require("../models/product");
const validateMongoDbId = require("../Validators/validateMongodbId");

exports.addCouponCode = async (req, res) => {
  try {
    const { code, type, discount, start_date, end_date, details, isPercent } =
      req.body;

    let couponObj = {};

    couponObj.code = code.toUpperCase();
    couponObj.type = type;
    couponObj.start_date = new Date(start_date);
    couponObj.end_date = new Date(end_date);
    couponObj.discount = discount;
    couponObj.details = details;
    couponObj.isPercent = isPercent;

    if (type != "cart") {
      couponObj.products = [];
      for (i in req.body.products) {
        couponObj.products.push(req.body.products[i]);
      }
    }

    const coupon = await Coupon.create(couponObj);
    return res.status(201).json({ coupon });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateCouponCode = async (req, res) => {
  try {
    const { id } = req.query;
    validateMongoDbId(id);
    const {
      type,
      isActive,
      discount,
      start_date,
      end_date,
      details,
      isPercent,
    } = req.body;

    let couponObj = {};

    couponObj.type = type;
    if (start_date) couponObj.start_date = new Date(start_date);
    if (end_date) couponObj.end_date = new Date(end_date);
    couponObj.discount = discount;
    couponObj.details = details;
    couponObj.isPercent = isPercent;
    couponObj.isActive = isActive;

    if (type != "cart") {
      couponObj.products = [];
      for (i in req.body.products) {
        couponObj.products.push(req.body.products[i]);
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(id, couponObj, {
      new: true,
    });
    return res.status(201).json({ coupon });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.fetchCouponCode = (req, res) => {
  Coupon.findOne({
    _id: req.query.id,
    isActive: true,
    start_date: { $lt: new Date() },
    end_date: { $gt: new Date() },
  }).exec((err, result) => {
    if (err) return res.status(400).send(err);
    return res.status(200).send(result);
  });
};

exports.fetchAllCouponCodes = (req, res) => {
  Coupon.find().exec((err, result) => {
    if (err) return res.status(400).send(err);
    return res.status(200).send(result);
  });
};

exports.deleteCouponCode = (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    Coupon.findOneAndDelete({ _id: id }).exec((error, coupon) => {
      if (error) return res.status(400).json({ error });
      if (coupon) {
        res.status(202).json({ message: "Coupon removed" });
      }
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
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
