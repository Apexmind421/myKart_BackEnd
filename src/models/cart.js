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
        variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
        quantity: { type: Number, default: 1 },
        price: { type: Number },
        shippingCost: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        teamBuy: { type: Boolean, default: false },
        discount_type: {
          type: String,
        },
        need_to_buy: {
          type: Number,
        },
        need_to_View: {
          type: Number,
        },
        need_to_Register: {
          type: Number,
        },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      },
    ],
    cartTotal: { type: Number, default: 0 },
    shippingCostTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    totalAfterDiscount: { type: Number },
    couponApplied: { type: String },
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
