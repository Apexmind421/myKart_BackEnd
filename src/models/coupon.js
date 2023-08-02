const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating objectSchema

const couponCodeSchema = new Schema({
  code: {
    type: String,
    min: 5,
    max: 15,
    trim: true,
    unique: true,
    required: true,
    index: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  min_buy: {
    type: Number,
  },
  max_discount: {
    type: Number,
  },
  type: {
    type: String,
    enum: ["product", "cart"],
    default: "product",
  },
  discount: {
    type: Number,
    required: true,
  },
  isPercent: { type: Boolean, require: true, default: true },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  details: {
    type: String,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Coupon", couponCodeSchema);
