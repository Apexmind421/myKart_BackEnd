const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating objectSchema

const couponUsageSchema = new Schema({
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    required: true,
  },
  used_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("CouponUsage", couponUsageSchema);
