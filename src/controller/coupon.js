const CouponCodeDiscount = require("../models/coupon");
const Product = require("../models/product");

exports.addCouponCodeDiscount = (req, res) => {
  const { couponCodeName, discount, expirationTime } = req.body;
  const couponObj = {};
  if (req.body.products) {
    couponObj.products = [];
    for (i in req.body.products) {
      couponObj.products.push({ productId: req.body.products[i] });
    }
  }
  couponObj.couponCodeName = couponCodeName;
  couponObj.discount = discount;
  couponObj.expirationTime = expirationTime;
  console.log("I am here " + couponCodeName);
  const coupon = new CouponCodeDiscount(couponObj);
  coupon.save((error, couponCodeName) => {
    if (error) return res.status(400).json({ error });
    if (couponCodeName) return res.status(201).json({ couponObj });
  });
};

exports.fetchCouponCodes = (req, res) => {
  CouponCodeDiscount.find().exec((err, result) => {
    if (err) return res.status(400).send(err);
    return res.status(200).send(result);
  });
};
