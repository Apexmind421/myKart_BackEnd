const mongoose = require("mongoose");
const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "Issue with payment",
        "General enquiry",
        "Issue with delivery",
        "other",
      ],
      default: "General enquiry",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    attachments: [{ type: "String" }],
    status: {
      type: String,
      enum: ["open", "pending", "in progress", "completed", "cancelled"],
      default: "open",
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    viewed: { type: Number, enum: [0, 1], default: 0 },
    client_viewed: { type: Number, enum: [0, 1], default: 0 },
    ticket_messages: [
      {
        messaged_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        attachments: { type: "String" },
        message: { type: "String" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tickets", ticketSchema);
