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
        priceChop: { type: mongoose.Schema.Types.ObjectId, ref: "PriceChop" },
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
    commission: {
      type: Number,
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
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "returnInitiated",
        "returnShipped",
        "returned",
      ],
      default: "pending",
    },
    orderStatus: [
      {
        type: {
          type: String,
          enum: [
            "pending",
            "confirmed",
            "packed",
            "shipped",
            "delivered",
            "returnInitiated",
            "returnShipped",
            "returned",
          ],
          default: "pending",
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
    isActive: {
      type: Boolean,
      default: true,
    },
    couponApplied: {
      type: Boolean,
      default: false,
    },
    coupon_code: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    courier_agency: { type: String },
    tracking_code: {
      type: String,
    },
    tracking_url: {
      type: String,
    },
    notes: {
      type: String,
    },
    delivery_date: {
      type: Date,
    },
    usedWiseCoins: { type: Number, default: 0 },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Teams" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
