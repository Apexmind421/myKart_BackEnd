const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    min: 3,
    max: 50,
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
  },
  alternatePhone: {
    type: String,
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true,
    min: 10,
    max: 100,
  },
  addressType: {
    type: String,
    enum: ["home", "work"],
    default: "home",
  },
  addressLine2: {
    type: String,
    trim: true,
    min: 10,
    max: 100,
  },
  area: {
    type: String,
    min: 10,
    max: 100,
  },
  zipCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ZIPCode",
    required: true,
  },
});

const userAddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    address: [addressSchema],
    defaultAddress: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAddress", userAddressSchema);
