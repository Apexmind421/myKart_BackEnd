//TO DO:const fast2sms = require("fast-two-sms");
//const env = require("dotenv");

const generateOTP = (otp_length) => {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};
const sendOTP = async ({ message, contactNumber }, next) => {
  try {
    const FAST2SMS = process.env.FAST2SMS;
    /*TO DO: To replace
    const res = await fast2sms.sendMessage({
      authorization: FAST2SMS,
      message,
      numbers: [contactNumber],
    });
    */
    const res = {
      authorization: FAST2SMS,
      message,
      numbers: [contactNumber],
    };
    console.log(res);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateOTP, sendOTP };
