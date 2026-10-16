const router = require('../../src/interfaces/http/createRouter')();
const requireAdmin = require('../../src/interfaces/http/middleware/requireAdmin');
const { adminCatalog: controller } = require('../../src/container');

router.get('/update/cinema', requireAdmin, controller.listCinemas);
router.post('/delete/cinema/:id', requireAdmin, controller.deleteCinema);
router.get('/update/cinema/:id', function(req, res) {
    return res.render('pages/404.ejs');
});
router.post('/update/cinema/:id', requireAdmin, controller.updateCinema);
router.post('/create/cinema/', requireAdmin, controller.createCinema);
router.get('/create/cinema/', function(req, res) {
    return res.render('pages/404.ejs');
});

module.exports = router;
