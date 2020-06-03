const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  mongoURI: process.env.MONGO_LOCAL,
  cookieKey: process.env.COOKIE_KEY,
};
