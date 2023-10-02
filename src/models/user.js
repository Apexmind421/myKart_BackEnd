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
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
      required: [true, "Please provide an email"],
    },
    mobile: {
      type: Number,
      required: [true, "Please provide mobile number"],
      unique: true,
    },
    phoneOtp: {
      type: String,
    },
    hash_password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
    seller_info: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    address: {
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
    referralCode: {
      type: String,
    },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    wiseCoins: { type: Number, default: 10 },
    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    tokenExpires: Date,
    numberOfFailedLogins: { type: Number, default: 0 },
    lockedTill: { type: Date },
  },
  { timestamps: true }
);

//userSchema.virtual('password').set(function(password){
//    this.set({hash_password:bcrypt.hashSync(password,10)});
//    console.log(this.hash_password);
//});

userSchema.virtual("fullName").get(function (pwd) {
  return `${this.firstName}${this.lastName}`;
});

/**
 * Check if mobile is taken
 * @param {string} mobile - The user's mobile
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isMobileTaken = async function (mobile, excludeUserId) {
  const user = await this.findOne({ mobile, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.index({ mobile: 1 });
// Set passwordChangedAt field to the current time when the user change the password
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods = {
  authenticate: function (password) {
    return bcrypt.compareSync(password, this.hash_password);
  },
};

module.exports = mongoose.model("User", userSchema);
