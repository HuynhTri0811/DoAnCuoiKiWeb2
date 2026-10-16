const router = require('express').Router();
const { auth } = require('../src/container');
const asyncHandler = require('../src/interfaces/http/asyncHandler');

router.get('/', auth.showForgotPassword);
router.post('/', asyncHandler(auth.requestPasswordReset));
router.get('/confirm', auth.showForgotPasswordConfirmation);
router.post('/confirm', asyncHandler(auth.confirmPasswordReset));
router.get('/resetpassword', auth.showResetPassword);
router.post('/resetpassword', asyncHandler(auth.resetPasswordHandler));

module.exports = router;
