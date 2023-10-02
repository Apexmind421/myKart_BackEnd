const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var brandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    image: { type: String },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Brand", brandSchema);
