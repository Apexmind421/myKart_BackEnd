const mongoose = require("mongoose");
const optionScehma = new mongoose.Schema(
  {
    variantName: {
      type: String,
      required: true,
      //unique: true,
    },
    variantValue: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductVariantOption", optionScehma);
