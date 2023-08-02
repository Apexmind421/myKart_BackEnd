const mongoose = require("mongoose");
// A
const teamSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Buy", "View", "Register"],
      required: true,
    },
    totalRequired: {
      type: Number,
    },
    currentRequired: {
      type: Number,
    },
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
