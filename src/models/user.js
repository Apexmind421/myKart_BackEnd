const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      min: 3,
      max: 20,
    },
    lastName: {
      type: String,
      trim: true,
      min: 3,
      max: 20,
    },
    name: {
      type: String,
      //required: [true, "Please tell us your name"],
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    hash_password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    address: {
      type: String,
    },
    companyName: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    discountCode: {
      type: String,
    },
    pushTokens: {
      type: Array,
      //    required: true,
    },
  },
  { timestamps: true }
);

//userSchema.virtual('password').set(function(password){
//    this.set({hash_password:bcrypt.hashSync(password,10)});
//    console.log(this.hash_password);
//});

userSchema.virtual("fullName").get(function (pwd) {
  console.log("This has been read");
  return `${this.firstName}${this.lastName}`;
});

userSchema.methods = {
  authenticate: function (password) {
    return bcrypt.compareSync(password, this.hash_password);
  },
};

module.exports = mongoose.model("User", userSchema);
