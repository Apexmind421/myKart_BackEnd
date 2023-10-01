const mongoose = require("mongoose");
const settingScehma = new mongoose.Schema({
  variable: {
    type: String,
    required: true,
  },
  value: {
    type: String,
  },
});

module.exports = mongoose.model("Settings", settingScehma);
