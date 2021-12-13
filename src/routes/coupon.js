const express = require("express");
const router = express.Router();
const { addCouponCodeDiscount } = require("../controller/coupon");
const { requireLogin, middleware } = require("../Validators/validation");
router.post("/coupons/add", requireLogin, addCouponCodeDiscount);

module.exports = router;
