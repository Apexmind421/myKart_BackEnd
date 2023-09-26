const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariant",
        },
        quantity: { type: Number, default: 1 },
        price: { type: Number },
        shippingCost: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        teamBuy: { type: Boolean, default: false },
        discountType: {
          type: String,
        },
        needToBuy: {
          type: Number,
        },
        needToView: {
          type: Number,
        },
        needToRegister: {
          type: Number,
        },
        needToSlash: {
          type: Number,
        },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        priceChop: { type: mongoose.Schema.Types.ObjectId, ref: "PriceChop" },
      },
    ],
    wallet_balance: { type: Number, default: 0 },
    cartTotal: { type: Number, default: 0.0 },
    shippingCostTotal: { type: Number, default: 0.0 },
    taxTotal: { type: Number, default: 0.0 },
    finalCartTotal: { type: Number, default: 0.0 },
    couponApplied: { type: Boolean, default: false },
    coupon_code: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    couponDiscount: { type: Number, default: 0.0 },

    /*  status: {
      type: String,
      enum: ["new", "in progress", "completed"],
      default: "new",
    },
    totalPrice: {
      type: String,
      required: true,
      default: "0",
    },
    numberOfItems: {
      type: String,
      required: true,
      default: "0",
    },*/
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
