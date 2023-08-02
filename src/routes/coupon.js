const express = require("express");
const router = express.Router();
const {
  addCouponCode,
  updateCouponCode,
  fetchCouponCode,
  fetchAllCouponCodes,
  deleteCouponCode,
  deleteAllCouponCodes,
} = require("../controller/coupon");
const { requireLogin, middleware } = require("../Validators/validation");
router.post("/coupon/add", requireLogin, addCouponCode);
router.put("/coupon/", requireLogin, updateCouponCode);
router.get("/coupon", fetchCouponCode);
router.get("/coupon-all", fetchAllCouponCodes);
router.delete("/coupon/:id", requireLogin, deleteCouponCode);
//TEMP
router.delete("/coupon_all", requireLogin, deleteAllCouponCodes);
module.exports = router;
