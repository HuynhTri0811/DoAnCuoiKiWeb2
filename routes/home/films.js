const router = require('express').Router();
const { home: controller } = require('../../src/container');
const asyncHandler = require('../../src/interfaces/http/asyncHandler');

router.get('/phim', asyncHandler(controller.showFilmList));
router.get('/phim/:id', asyncHandler(controller.showFilm));
router.post('/phim/:id', controller.selectCinema);

module.exports = router;
