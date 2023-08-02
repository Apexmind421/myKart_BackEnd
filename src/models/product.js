const mongoose = require("mongoose");

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
    brand: {
      type: String,
    },
    sold: {
      //Need to be updated from order
      type: Number,
      required: true,
      default: 0,
    },
    quantity: {
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
    discount: {
      type: Number,
    },
    shippingCost: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    offer: {
      type: Number,
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
    /* variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariant",
      },
    ],*/
    //[variantScehma],
    attributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
      },
    ],
    rating: { type: Number, default: 5, required: true },
    numReviews: { type: Number, default: 0, required: true },
    reviews: [
      reviewScehma,
      /*{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reviews",
      },*/
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    discount_type: {
      type: String,
      enum: ["Buy", "View", "Register"],
    },
    need_to_buy: {
      type: Number,
      default: 0,
    },
    need_to_View: {
      type: Number,
      default: 0,
    },
    need_to_Register: {
      type: Number,
      default: 0,
    },
    tax: { type: Number },
    updatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productScehma);
