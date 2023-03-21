
const {service, email, password, otheremail} = require('../config/config.js')

const nodemailer = require('nodemailer');

let transport = nodemailer.createTransport({
  service: service,
  auth: {
     user: email,
     pass: password
  }
});

//This will now work


const sendEnquiryMail = function(req,res,next){

  const message = {
    from: email, // Sender address
    to: email,     
    subject: req.body.title, // Subject line
    text: `${req.body.name} with the email ${req.body.email} sent the message below:\n` + req.body.message // Plain text body
  };

  const responseMessage = {
    from: email, // Sender address
    to: req.body.email,  
    bcc: otheremail,     
    subject: `Confirmation of Enquiry by ${req.body.name}`, // Subject line
    text: `Thank you for sending an enquiry to me. I will respond to you within 2-4 business days.\n\nHope to speak to you soon!\n\n\n(This is an automated response please do not reply to this email)` // Plain text body
  };


  const prom1= transport.sendMail(message, function(err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info);
    }
  });

  const prom2=transport.sendMail(responseMessage, function(err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info);
    }
  });

  Promise.all([prom1,prom2]).then(()=>{
    res.statusMessage ="Successfully delivered the emails";
    res.status(200).end();
  }).catch(()=>{
    res.statusMessage ="Unsuccessfully delivered the emails";
    res.status(400).end();
  });
}



module.exports = {sendEnquiryMail};