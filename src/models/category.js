const mongoose = require("mongoose");
const categoryScehma = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
    },
    categoryImage: { type: String },
    banner: { type: String },
    parentId: {
      type: String,

      index: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);
//Create index on parentId
module.exports = mongoose.model("Category", categoryScehma);
