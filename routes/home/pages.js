const router = require('express').Router();
const { home: controller } = require('../../src/container');
const asyncHandler = require('../../src/interfaces/http/asyncHandler');

router.get('/', asyncHandler(controller.showHome));
router.get('/filmSearch', asyncHandler(controller.search));
router.get('/forgotPassword', function(req, res) {
    return res.render('auth/forgot-password.ejs');
});
router.get('/logout', controller.logout);
router.get('/support', controller.showSupport);
router.get('/intro', controller.showIntro);

module.exports = router;
