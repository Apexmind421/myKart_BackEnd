const mongoose = require("mongoose");
const attributeSetScehma = new mongoose.Schema(
  {
    attribute: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      //unique: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attribute", attributeSetScehma);
