const mongoose = require("mongoose");
const categoryScehma = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Category", categoryScehma);
