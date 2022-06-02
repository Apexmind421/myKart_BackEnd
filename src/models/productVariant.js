const mongoose = require("mongoose");
const variantScehma = new mongoose.Schema(
  {
    /* variations: [
      {
        varationName: {
          type: String,
        },
        varationValue: {
          type: String,
        },
      },
    ],*/
    vartionOption: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductOption",
        required: true,
      },
    ],
    varaiantPrice: {
      type: Number,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductVariant", variantScehma);
