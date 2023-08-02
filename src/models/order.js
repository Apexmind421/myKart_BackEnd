const mongoose = require("mongoose");
// A
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAddress.address",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
        quantity: { type: Number, default: 1 },
        price: { type: Number },
        shippingCost: { type: Number },
        tax: { type: Number },
        discount: { type: Number },
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teams",
        },
      },
    ],
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "cancelled", "refund"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["cod", "card", "upi"],
      required: true,
    },
    paymentId: {
      type: String,
    },
    is_shipping_price_returnable: {
      type: Boolean,
      default: false,
    },
    orderStatus: [
      {
        type: {
          type: String,
          enum: ["ordered", "packed", "shipped", "delivered"],
          default: "ordered",
        },
        date: {
          type: Date,
          default: new Date(),
        },
        /*    isCompleted: {
          type: Boolean,
          default: false,
        }, */
      },
    ],
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    tracking_code: {
      type: String,
    },
    notes: {
      type: String,
    },
    delivery_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
