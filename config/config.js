const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  email: process.env.EMAIL_ADDRESS,
  password: process.env.EMAIL_KEY,
  service: process.env.PROVIDER,
  otheremail: process.env.BCC_EMAIL
};