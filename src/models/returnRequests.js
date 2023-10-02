const mongoose = require("mongoose");
// A
const returnSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    return_reason: {
      type: String,
      enum: [
        "DoesNotLike",
        "NotSuitable",
        "SlowDelivery",
        "Damaged",
        "ProductMismatch",
      ],
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      required: true,
      default: "Pending",
    },
    seller_approval: {
      type: Boolean,
      default: false,
    },
    admin_approval: {
      type: Boolean,
      default: false,
    },
    attachments: [{ type: "String" }],
    type: {
      type: String,
      enum: ["Return", "Refund"],
    },
    refund_amount: {
      type: Number,
    },
    reject_reason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReturnRequests", returnSchema);
