var express = require('express');
var router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/ask', emailController.sendEnquiryMail);


module.exports = router;
