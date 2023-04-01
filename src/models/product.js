const mongoose = require("mongoose");

const reviewScehma = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  comment: { type: String, required: true },
  review_date: { type: String },
});

const variantScehma = new mongoose.Schema({
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
      ref: "ProductVariantOption",
      required: true,
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
  },*/
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
      lowercase: true,
    },
    brand: {
      type: String,
    },
    sold: {
      //Need to be updated from order
      type: Number,
      required: true,
      default: 0,
    },
    views: {
      //Need to be updated on view of product details
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
    mainImage: {
      type: String,
      //  required: [true, 'A product must have a main image']
    },
    productImages: [
      {
        img: { type: String },
      },
    ],
    variants: [variantScehma],
    options: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariantOption",
      },
    ],
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
          default: "Others",
        },
      },
    ],
    lengthInCM: {
      type: Number,
    },
    weightInCM: {
      type: Number,
    },
    heightInCM: {
      type: Number,
    },
    WeightInGrams: {
      type: Number,
    },
    inTheBox: [
      {
        item: { type: String },
      },
    ],
    warrentyReturns: {
      type: String,
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
