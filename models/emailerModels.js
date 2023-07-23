const {service, email, password, otheremail} = require('../config/config.js')

const nodemailer = require('nodemailer');


let Transport = nodemailer.createTransport({
  service: service,
  auth: {
     user: email,
     pass: password
  }
});

module.exports = {Transport}