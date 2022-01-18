const mongoose = require("mongoose");
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
  price: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

module.exports = mongoose.model("Varant", variantScehma);
