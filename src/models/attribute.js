const mongoose = require("mongoose");
const attributeScehma = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      //unique: true,
    },
    value: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attribute", attributeScehma);
