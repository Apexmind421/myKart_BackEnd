const mongoose = require("mongoose");

const reviewScehma = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  comment: { type: String, required: true },
  review_date: { type: String },
});

const variantScehma = new mongoose.Schema({
  variations: [
    {
      varationName: {
        type: String,
      },
      varationValue: {
        type: String,
      },
    },
  ],
  varaiantPrice: {
    type: Number,
    required: true,
  },
  /* product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sku: {
    type: String,
    required: true,
    trim: true,
  },*/
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const productScehma = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
    },
    sold: {
      type: Number,
      required: true,
      default: 0,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    offer: {
      type: Number,
    },
    productImages: [
      {
        img: { type: String },
      },
    ],
    variants: [variantScehma],
    rating: { type: Number, default: 5, required: true },
    numReviews: { type: Number, default: 0, required: true },
    reviews: [reviewScehma],
    specifications: [
      {
        specName: {
          type: String,
        },
        specValue: {
          type: String,
        },
        specType: {
          type: String,
        },
      },
    ],
    inTheBox: [
      {
        item: { type: String },
      },
    ],
    warrentyReturns: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    avialableCities: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productScehma);
