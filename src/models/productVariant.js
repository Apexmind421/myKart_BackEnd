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
    variations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    teamPrice: {
      type: Number,
    },
    actualPrice: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
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
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    productImages: [
      {
        img: { type: String },
      },
    ],
    lengthInCM: {
      type: Number,
    },
    widthInCM: {
      type: Number,
    },
    heightInCM: {
      type: Number,
    },
    WeightInGrams: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductVariant", variantScehma);
