const mongoose = require("mongoose");
const reviewScehma = new mongoose.Schema(
  {
    name: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, default: 0 },
    comment: {
      type: String,
      //required: true
    },
    // review_date: { type: Date },
  },
  { timestamps: true }
);

//module.exports = mongoose.model("Reviews", reviewScehma);
