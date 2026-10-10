const router = require('express').Router();

router.use('/', require('./dashboard'));
router.use('/', require('./cinemas'));
router.use('/', require('./users'));
router.use('/', require('./films'));
router.use('/', require('./cineplexes'));
router.use('/', require('./showtimes'));

module.exports = router;
