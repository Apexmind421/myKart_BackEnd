const mongoose = require("mongoose");
// A
const teamSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    type: {
      type: String,
      enum: ["Buy", "View", "Register", "Slash"],
      required: true,
    },
    totalRequired: {
      type: Number,
    },
    currentRequired: {
      type: Number,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["Open", "Closed", "Cancelled"],
      required: true,
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teams", teamSchema);
