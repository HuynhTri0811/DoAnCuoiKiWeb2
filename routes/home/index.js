const router = require('express').Router();

router.use('/', require('./pages'));
router.use('/', require('./films'));
router.use('/', require('./booking'));

module.exports = router;
