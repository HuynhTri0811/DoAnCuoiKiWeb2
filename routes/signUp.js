const router = require('express').Router();
const { auth } = require('../src/container');
const asyncHandler = require('../src/interfaces/http/asyncHandler');

router.get('/', auth.showSignup);
router.post('/', asyncHandler(auth.signup));
router.post('/confirm/', asyncHandler(auth.confirmSignup));

module.exports = router;
