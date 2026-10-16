const router = require('express').Router();
const { auth } = require('../src/container');
const asyncHandler = require('../src/interfaces/http/asyncHandler');

router.get('/', auth.showLogin);
router.post('/', asyncHandler(auth.login));

module.exports = router;
