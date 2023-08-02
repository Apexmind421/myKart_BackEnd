const mongoose = require("mongoose");

const productViewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  viewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  reference_code: { type: String },
  referred_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  view_date: { type: Date, required: true },
});

module.exports = mongoose.model("ProductViewHistory", productViewSchema);
