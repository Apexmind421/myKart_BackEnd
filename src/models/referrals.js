const mongoose = require("mongoose");
const referralScehma = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    MaxNumberOfReferrals: { type: Number, default: 10 },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referrals", referralScehma);
