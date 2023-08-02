const mongoose = require("mongoose");

const zipCodeScehma = new mongoose.Schema({
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    required: true,
  },
});

module.exports = mongoose.model("ZIPCode", zipCodeScehma);
