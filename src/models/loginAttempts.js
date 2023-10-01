const mongoose = require("mongoose");
const loginAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ip_address: {
    type: String,
  },
  activity: {
    type: String,
    enum: ["login", "logout"],
  },
  createdAt: { type: Date },
  isSuccess: {
    type: Boolean,
  },
});

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
