const mongoose = require("mongoose");

const reviewScehma = new mongoose.Schema({
  name: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, default: 0 },
  comment: {
    type: String,
    //required: true
  },
  //TO DO:
  productId: {
    type: String,
  },
  images: [{ type: String }],
  review_date: { type: Date },
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    show_order: {
      type: Number,
      default: 100,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    total_allowed_quantity: {
      type: Number,
      default: 10,
    },
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
    },
    tax: { type: Number },
    shippingCost: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    is_returnable: {
      type: Boolean,
      default: false,
    },
    made_in: {
      type: String,
    },
    hsn_code: {
      type: String,
    },
    sku: {
      type: String,
    },
    thumbnailImage: {
      type: String,
      //  required: [true, 'A product must have a main image']
    },
    productImages: [
      {
        img: { type: String },
      },
    ],

    attributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
      },
    ],

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
    widthInCM: {
      type: Number,
    },
    heightInCM: {
      type: Number,
    },
    WeightInGrams: {
      type: Number,
    },
    inTheBox: [
      { type: String },
      /* {
        item: { type: String },
      },*/
    ],
    warrentyReturns: {
      type: String,
      trim: true,
    },

    avialableCities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ZIPCode",
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    flashSale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlashSale",
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    discountType: {
      type: String,
      enum: ["Buy", "View", "Register", "Slash"],
    },
    needToBuy: {
      type: Number,
      default: 0,
    },
    needToView: {
      type: Number,
      default: 0,
    },
    needToRegister: {
      type: Number,
      default: 0,
    },
    needToSlash: {
      type: Number,
      default: 0,
    },
    priceChop: { type: Boolean, default: false },
    rating: { type: Number, default: 5, required: true },
    numReviews: { type: Number, default: 0, required: true },
    reviews: [
      reviewScehma,
      /*{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reviews",
      },*/
    ],
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    /* variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariant",
      },
    ],*/
    //[variantScehma],
    updatedAt: Date,
  },
  { timestamps: true }
);

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
      ref: "ProductOption",
      required: true,
    },
  ],
  variantPrice: {
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
module.exports = mongoose.model("Product", productScehma);
