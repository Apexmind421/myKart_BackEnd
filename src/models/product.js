const mongoose = require("mongoose");

const reviewScehma = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  comment: { type: String, required: true },
  review_date: { type: String },
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
    quantity: {
      type: Number,
      required: true,
    },
    rating: { type: Number, default: 0, required: true },
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
    city: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productScehma);

/* 
            dimensions: {
                type: String
            },
            weight: {
                type: String
            },
            displayType: {
                type: String
            },
            displaySize: {
                type: String
            },
            displayResolution: {
                type: String
            },
            os: {
                type: String
            },
            cpu: {
                type: String
            },
            internalMemory: {
                type: String
            },
            ram: {
                type: String
            },
            camera: {
                type: String
            },
            battery: {
                type: String
            },
            color: {
                type: String
            },
            brand: {
                type: String
            },
            */
