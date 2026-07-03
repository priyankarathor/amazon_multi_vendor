          const otpGenerator = require("otp-generator");

          // Both email and phone now use the same generator and the same
          // expiry window. Previously phone used Math.random() with a 5-min
          // expiry and email used otp-generator with a 1-min expiry — no
          // functional reason for that split, so it's unified here.
          const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

          const generateOtp = () =>
            otpGenerator.generate(6, {
              upperCaseAlphabets: false,
              lowerCaseAlphabets: false,
              specialChars: false,
            });

          const getOtpExpiry = () => new Date(Date.now() + OTP_EXPIRY_MS);
 
          module.exports = { generateOtp, getOtpExpiry, OTP_EXPIRY_MS };
