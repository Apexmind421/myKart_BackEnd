const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    store_name: {
      type: String,
    },
    tax_name: {
      type: String,
      required: true,
    },
    tax_number: {
      type: String,
    },
    pan_number: {
      type: String,
    },
    commission: {
      type: Number,
      default: 0.0,
    },
    address_proof: {
      type: String,
      required: true,
    },
    aadhar_card: {
      type: String,
      required: true,
    },
    bank_name: {
      type: String,
      required: true,
    },
    bank_code: {
      type: String,
      required: true,
    },
    account_name: {
      type: String,
      required: true,
    },
    account_number: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "not-approved", "deactive", "removed"],
      default: "user",
    },
    proofs: {
      type: String,
    },
    no_of_ratings: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0.0,
    },
    store_url: {
      type: String,
    },
    logo: { type: String },
    store_description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seller", sellerSchema);
