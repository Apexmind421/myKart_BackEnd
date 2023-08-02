const mongoose = require("mongoose");

const flashSaleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    status: { type: Number, enum: [0, 1], default: 0 },
    featured: { type: Number, enum: [0, 1], default: 0 },
    background_color: { type: String, default: "white" },
    text_color: { type: String, default: "white" },
    banner: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlashSale", flashSaleSchema);
