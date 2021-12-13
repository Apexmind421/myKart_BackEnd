const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// creating objectSchema

const couponCodeSchema = new Schema({
  couponCodeName: {
    type: String,
    min: 5,
    max: 15,
    trim: true,
    required: true,
  },
  products: [
    {
      productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    },
  ],
  discount: {
    type: Number,
    required: true,
  },
  isPercent: { type: Boolean, require: true, default: true },
  discountStatus: {
    type: Boolean,
    required: true,
    default: true,
  },

  /*  originalPrice: {
        type: Number,
    },
    finalPrice: {
        type: Number,
    },
  createdAt: {
    type: String,
    // default: moment().format("DD/MM/YYYY") + ";" + moment().format("hh:mm:ss"),
  },*/
  updatedAt: Date,
  expirationTime: {
    type: String,
    required: true,
  },
});

const CouponCodeDiscount = mongoose.model(
  "couponcode-discount-product",
  couponCodeSchema
);
module.exports = CouponCodeDiscount;
