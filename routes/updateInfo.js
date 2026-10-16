const router = require('express').Router();
const { profile } = require('../src/container');
const asyncHandler = require('../src/interfaces/http/asyncHandler');

router.get('/', asyncHandler(profile.show));
router.post('/pagedf', profile.backToHome);
['/name', '/numberphone', '/email', '/password', '/address'].forEach(route => {
    router.post(route, function(req, res, next) {
        req.params.field = route.slice(1);
        return asyncHandler(profile.update)(req, res, next);
    });
});

module.exports = router;
