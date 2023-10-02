const envVars = require("dotenv");
//environment variable
//dotenv.config();
envVars.config({ path: "config.env" });
module.exports.config = {
  env: envVars.NODE_ENV,
  server: {
    port: envVars.PORT,
  },
  db: {
    url: envVars.DATABASE_CONNECTION,
    password: envVars.DATABASE_PASSWORD,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    from: envVars.CLIENT_EMAIL,
    client: {
      id: envVars.CLIENT_ID,
      secret: envVars.CLIENT_SECRET,
    },
    RedirectUri: envVars.REDIRECT_URI,
    RefreshToken: envVars.REFRESH_TOKEN,
  },
  cloud: {
    name: envVars.CLOUD_NAME,
    api_key: envVars.CLOUD_API_KEY,
    api_secret: envVars.CLOUD_API_SECRET,
    project: envVars.CLOUD_PROJECT,
  },
  stripe: {
    secret_key: envVars.STRIPE_SECRET_KEY,
  },
};
