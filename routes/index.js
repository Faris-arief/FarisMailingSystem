var express = require('express');
var router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/ask', emailController.sendEnquiryMail);
router.post('/askHypersense', emailController.sendHypersenseEnquiryMail);


module.exports = router;
