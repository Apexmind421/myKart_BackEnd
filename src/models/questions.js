const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    votes: [{ type: "String" }],
    totalVotes: { type: Number, default: 0 },
    //TO DO:{ type: Number, default: 0 },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    answered_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Questions", questionSchema);
