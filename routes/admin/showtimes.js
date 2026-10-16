const router = require('../../src/interfaces/http/createRouter')();
const requireAdmin = require('../../src/interfaces/http/middleware/requireAdmin');
const { adminShowtimes: controller } = require('../../src/container');

router.get('/update/cinemaTimeShow/cinema/:id', requireAdmin, controller.listByCinema);
router.get('/update/cinemaTimeShow/film/:id', requireAdmin, controller.listByFilm);
router.post('/create/cinemaTimeShow/', requireAdmin, controller.create);
router.get('/create/cinemaTimeShow/', requireAdmin, controller.createPage);
router.post('/delete/cinemaTimeShow/cinema/:id', requireAdmin, controller.delete);

module.exports = router;
