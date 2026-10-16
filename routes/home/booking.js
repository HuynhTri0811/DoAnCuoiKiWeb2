const router = require('express').Router();
const { booking } = require('../../src/container');
const asyncHandler = require('../../src/interfaces/http/asyncHandler');

router.get('/phim/muave/:id', asyncHandler(booking.showSeats));
router.post('/phim/muave/:id', asyncHandler(booking.loginForBooking));
router.get('/phim/muave/comeback/:id', booking.returnToFilm);
router.post('/phim/muave/thongtinve/:id', asyncHandler(booking.book));
router.post('/phim/muave/thongtinve/back/:id', asyncHandler(booking.backFromConfirmation));

module.exports = router;
