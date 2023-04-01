const mongoose = require("mongoose");
const optionScehma = new mongoose.Schema(
  {
    variantName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      //unique: true,
    },
    variantValue: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductVariantOption", optionScehma);
